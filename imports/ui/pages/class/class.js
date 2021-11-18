import { Template } from 'meteor/templating'
import { State } from '../../../api/session/State'
import { OtuLea } from '../../../api/remotes/OtuLea'
import { Course } from '../../../contexts/courses/Course'
import { Competency } from '../../../contexts/content/competency/Competency'
import { ColorType } from '../../../contexts/content/color/ColorType'
import { Dimension } from '../../../contexts/content/dimension/Dimension'
import { callMethod } from '../../../infrastructure/methods/callMethod'
import classLanguage from './i18n/classLanguage'
import './class.html'

const LocalDimensionsCollection = new Mongo.Collection(null)
const LocalCompetencyCollection = new Mongo.Collection(null)

Template.class.onCreated(function () {
  const instance = this

  instance.init({
    contexts: [Course, Dimension, Competency],
    useLanguage: [classLanguage],
    remotes: [OtuLea],
    debug: true,
    onComplete () {
      instance.state.set('initComplete', true)
    }
  })

  instance.autorun(() => {
    const data = Template.currentData()
    const { classId } = data.params
    const currentClass = State.currentClass()

    if (currentClass !== classId) {
      State.currentClass(classId)
    }

    if (State.currentParticipant()) {
      State.currentParticipant(null)
    }

    callMethod({
      name: Course.methods.get,
      args: { _id: classId },
      prepare: () => instance.api.debug('load course doc'),
      failure: instance.api.notify,
      success: courseDoc => {
        instance.api.debug('course doc loaded')
        instance.state.set({
          courseDoc,
          title: courseDoc.title
        })
      }
    })
  })

  instance.autorun(() => {
    const courseDoc = instance.state.get('courseDoc')
    if (!courseDoc) return

    instance.api.debug('load dimensions')

    callMethod({
      name: Dimension.methods.all,
      args: {},
      failure: error => console.error(error),
      success: (dimensionDocs) => {
        instance.api.debug('dimensions loaded', { dimensionDocs })
        dimensionDocs.forEach(doc => {
          LocalDimensionsCollection.upsert(doc._id, { $set: doc })
        })
        instance.state.set('dimensionsLoaded', dimensionDocs.length > 0)
      }
    })
  })

  instance.autorun(() => {
    const dimensionDoc = instance.state.get('dimensionDoc')
    const courseDoc = instance.state.get('courseDoc')
    if (!courseDoc || !dimensionDoc) return


    const users = courseDoc.users.map(u => u._id)
    const dimension = dimensionDoc._id

    OtuLea.getFeedback({ users, dimension })
      .then(feedback => {
        // if no docs have been found then these users have not completed tests
        // for this dimension yet; we need to communicate this
        if (!feedback || feedback.length === 0) {
          return instance.state.set({
            hasFeedback: false,
            feedbackLoaded: true
          })
        }

        const alphaLevels = new Map()
        const alphaLevelIds = new Set()
        const competencies = new Map()
        const competencyIds = new Set()
        const addToMap = (map, idSet, idName) => (entry) => {
          if (!entry.isGraded) return

          const perc = entry.perc
          const id = entry[idName]
          const existingScore = map.get(id) || { id, score: 0, sum: 0, count: 0 }

          existingScore.count++
          existingScore.sum += existingScore.sum + perc
          existingScore.score = existingScore.sum / existingScore.count
          map.set(id, existingScore)
          idSet.add(id)
        }

        const addToAlpha = addToMap(alphaLevels, alphaLevelIds, 'alphaLevelId')
        const addToComps = addToMap(competencies, competencyIds, 'competencyId')

        feedback.forEach(entry => {
          (entry.alphaLevels || []).forEach(addToAlpha)
          ;(entry.competencies || []).forEach(addToComps)
        })

        // load alpha docs
        callMethod({
          name: Competency.methods.get,
          args: { ids: Array.from(competencyIds) },
          failure: instance.api.notify,
          success: (competencyDocs = []) => {
            competencyDocs.forEach(doc => {
              LocalCompetencyCollection.upsert(doc._id, { $set: doc })
            })
            instance.state.set('competencyDocsLoaded', true)
          }
        })

        // load competency docs

        const processed = {
          alphaLevels: Array.from(alphaLevels.values()),
          competencies: Array.from(competencies.values())
        }

        instance.state.set({
          hasFeedback: true,
          feedbackLoaded: true,
          processed: processed
        })
      })
      .catch(e => {
        instance.state.set({
          feedbackLoaded: true
        })
        instance.api.notify(e)
      })
  })
})

Template.class.helpers({
  loadComplete () {
    return Template.getState('initComplete') && Template.getState('dimensionsLoaded')
  },
  title () {
    return Template.getState('title')
  },
  dimensions () {
    return LocalDimensionsCollection.find()
  },
  dimensionDoc () {
    return Template.getState('dimensionDoc')
  },
  color () {
    return Template.getState('color')
  },
  otuleaConnected () {
    return OtuLea.isConnected()
  },
  feedbackLoaded () {
    return Template.getState('feedbackLoaded')
  },
  hasFeedback () {
    return Template.getState('hasFeedback')
  },
  processed () {
    return Template.getState('processed')
  },
  competencyDoc (id) {
    return Template.getState('competencyDocsLoaded') &&
      LocalCompetencyCollection.findOne(id)
  }
})

Template.class.events({
  'change #dimension-select' (event, templateInstance) {
    event.preventDefault()

    const selectedDimension = templateInstance.$(event.currentTarget).val() || null
    const dimensionDoc = LocalDimensionsCollection.findOne(selectedDimension)
    const color = ColorType.byIndex(dimensionDoc.colorType)?.type

    templateInstance.state.set({ dimensionDoc, color })
  }
})
