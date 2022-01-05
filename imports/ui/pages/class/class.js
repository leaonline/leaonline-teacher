import { Template } from 'meteor/templating'
import { OtuLea } from '../../../api/remotes/OtuLea'
import { Course } from '../../../contexts/courses/Course'
import { User } from '../../../contexts/users/User'
import { State } from '../../../api/session/State'
import { Competency } from '../../../contexts/content/competency/Competency'
import { AlphaLevel } from '../../../contexts/content/alphalevel/AlphaLevel'
import { ColorType } from '../../../contexts/content/color/ColorType'
import { Dimension } from '../../../contexts/content/dimension/Dimension'
import { callMethod } from '../../../infrastructure/methods/callMethod'
import { getUserName } from '../../utils/getUserName'
import classLanguage from './i18n/classLanguage'
import visualizationData from './data/visualization'
import './visualization/visualization'
import './class.html'

Template.class.onCreated(function () {
  const instance = this

  // reset current participant, in case we come from a participant page
  State.currentParticipant(null)

  instance.init({
    contexts: [Course, Dimension, Competency, AlphaLevel, User],
    useLanguage: [classLanguage],
    remotes: [OtuLea],
    debug: false,
    onComplete () {
      instance.state.set('initComplete', true)
    }
  })

  instance.autorun(() => {
    const data = Template.currentData()
    const { classId } = data.params

    callMethod({
      name: Course.methods.get,
      args: { _id: classId },
      prepare: () => instance.api.debug('load course doc'),
      failure: instance.api.notify,
      success: courseDoc => {
        instance.api.debug('course doc loaded')
        instance.state.set({
          courseDoc,
          title: courseDoc?.title
        })
      }
    })
  })

  // load all selectable dimensions

  instance.autorun(() => {
    const courseDoc = instance.state.get('courseDoc')
    if (!courseDoc) return

    console.debug(courseDoc)

    if (!courseDoc.users?.length) {
      // TODO fix when course has no users :-(
    }

    instance.api.debug('load dimensions')



    instance.api.debug('load users')

    callMethod({
      name: User.methods.get,
      args: { ids: courseDoc.users },
      failure: instance.api.notify,
      success: (users = []) => {
        if (courseDoc) {
          courseDoc.users = users
          State.currentClass(courseDoc)
        }
        instance.state.set({ users })
      }
    })
  })

  instance.autorun(() => {
    const dimensionDoc = instance.state.get('dimensionDoc')
    const courseDoc = instance.state.get('courseDoc')
    const userDocs = instance.state.get('users')

    if (!courseDoc || !dimensionDoc || !userDocs) { return }

    const dimension = dimensionDoc._id
    const users = userDocs.map(userDoc => userDoc.account._id)

    OtuLea.getRecords({ users, dimension })
      .then((records) => instance.state.set({ records }))
      .catch(instance.api.notify)
  })

  const byNewestDate = (a, b) => new Date(b.completedAt) - new Date(a.completedAt)

  instance.autorun(() => {
    const records = instance.state.get('records')
    const userDocs = instance.state.get('users')

    if (!userDocs?.length || !records?.length) { return }

    const userMap = new Map()
    userDocs.forEach(user => userMap.set(user.account._id, user))

    let id = 0

    const recordsByUser = new Map()
    records.forEach(record => {
      if (!recordsByUser.has(record.userId)) {
        const user = userMap.get(record.userId)
        recordsByUser.set(record.userId, {
          _id: record.userId,
          name: getUserName(user),
          allDate: []
        })
      }

      const userRecords = recordsByUser.get(record.userId)
      const levels = [
        {
          alpha: 'Alpha-Level 5',
          value: 0,
        },
        {
          alpha: 'Alpha-Level 4',
          value: 0,
        },
        {
          alpha: 'Alpha-Level 3',
          value: 0,
        },
        {
          alpha: 'Alpha-Level 2',
          value: 0,
        },
        {
          alpha: 'Alpha-Level 1',
          value: 0,
        },
      ]

      record.alphaLevels.forEach(entry => {
        const index = levels.length - entry.level
        levels[index].value = Math.round(entry.perc * 10)
        levels[index].alpha = entry.description
      })


      userRecords.allDate.push({
        id: `graph${++id}`,
        date: new Date(record.completedAt).toLocaleDateString(),
        level: levels
      })
    })



    const results = Array.from(recordsByUser.values()).filter(doc => doc.allDate.length > 0)
    instance.state.set({ results, hasFeedback: results.length > 0 })
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
    return Dimension.localCollection().find()
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
  competencyDoc (id) {
    return Template.getState('competencyDocsLoaded') &&
      Competency.localCollection().findOne(id)
  },
  alphaLevelDoc (id) {
    return Template.getState('alphaLevelDocsLoaded') &&
      AlphaLevel.localCollection().findOne(id)
  },
  users () {
    return Template.getState('users')
  },
  courseDoc () {
    return Template.getState('courseDoc')
  },
  visualizationData () {
    const results = Template.getState('results')
    return results && { results }
  }
})

Template.class.events({
  'change #dimension-select' (event, templateInstance) {
    event.preventDefault()

    const selectedDimension = templateInstance.$(event.currentTarget).val() || null
    const dimensionDoc = selectedDimension && Dimension.localCollection().findOne(selectedDimension)
    const color = selectedDimension && ColorType.byIndex(dimensionDoc.colorType)?.type

    templateInstance.state.set({ dimensionDoc, color })
  }
})
