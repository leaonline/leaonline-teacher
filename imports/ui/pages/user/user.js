import { Template } from 'meteor/templating'
import { State } from '../../../api/session/State'
import { Course } from '../../../contexts/courses/Course'
import { User } from '../../../contexts/users/User'
import { OtuLea } from '../../../api/remotes/OtuLea'
import { AlphaLevel } from '../../../contexts/content/alphalevel/AlphaLevel'
import { CompetencyCategory } from '../../../contexts/content/competency/CompetencyCategory'
import { Competency } from '../../../contexts/content/competency/Competency'
import { Dimension } from '../../../contexts/content/dimension/Dimension'
import { callMethod } from '../../../infrastructure/methods/callMethod'
import { processFeedback } from '../../../api/feedback/processFeedback'
import userLanguage from './i18n/userLanguage'
import './user.scss'
import './user.html'

Template.user.onCreated(function () {
  const instance = this

  instance.init({
    contexts: [Course, Competency, Dimension, AlphaLevel, User],
    remotes: [OtuLea],
    useLanguage: [userLanguage],
    onComplete () {
      instance.state.set('initComplete', true)
    }
  })

  instance.autorun(() => {
    const data = Template.currentData()

    const { userId } = data.params
    const currentUser = Tracker.nonreactive(() => State.currentParticipant())

    if (currentUser !== userId) {
      State.currentParticipant(userId)
    }

    callMethod({
      name: User.methods.get,
      args: { _id: userId },
      failure: instance.api.notify,
      success (userDoc) {
        instance.state.set({ userDoc })
      }
    })
  })

  instance.autorun(() => {
    const userDoc = instance.state.get('userDoc')

    if (!userDoc || !OtuLea.isLoggedIn()) return

    // load all feedbacks from all dimensions
    OtuLea.getFeedback({ users: [userDoc.account._id], addSession: true })
      .catch(instance.api.notify)
      .then(({ feedbackDocs = [], sessionDocs = [] }) => {
        instance.state.set({ feedbackDocs, sessionDocs })

        return  processFeedback({ feedback: feedbackDocs })
      })
      .then((processed) => {
        callMethod({
          name: AlphaLevel.methods.get,
          args: { ids: processed.alphaLevelIds },
          failure: instance.api.notify,
          success: (alphaLevelDocs = []) => {
            instance.api.debug({ alphaLevelDocs })

            console.debug({ alphaLevelDocs })
            alphaLevelDocs.forEach(doc => {
              AlphaLevel.localCollection().upsert(doc._id, { $set: doc })
            })

            instance.state.set('alphaLevelDocsLoaded', true)
          }
        })

        return processed
      })
      .then((processed) => {
        callMethod({
          name: Competency.methods.get,
          args: { ids: processed.competencyIds },
          failure: instance.api.notify,
          success: (competencyDocs = []) => {
            instance.api.debug({ competencyDocs })

            console.debug({ competencyDocs })
            competencyDocs.forEach(doc => {
              Competency.localCollection().upsert(doc._id, { $set: doc })
            })

            instance.state.set('competencyDocsLoaded', true)
          }
        })
      })
  })

})

Template.user.helpers({
  loadComplete () {
    return Template.getState('initComplete')
  },
  competencyCategories () {
    const cursor = CompetencyCategory.collection().find()
    // console.log(cursor.fetch())
    if (cursor.count() === 0) return null
    return cursor
  },
  competencies () {
    const CompetencyCategoriesArray = CompetencyCategory.collection().find({}, { fields: { title: 0 } }).fetch()
    const competencyArray = Competency.collection().find().fetch()
    competencyArray.forEach(function (val, index) {
      Object.assign(competencyArray[index], { competencyCategoryId: CompetencyCategoriesArray[index]._id })
    })
    return competencyArray
  },
  competencyCategoryIdCheck (CompetencyCategoryId, competencyCategoryIdInCompetency) {
    if (CompetencyCategoryId === competencyCategoryIdInCompetency) {
      return true
    }
  },
  sessionDocs () {
    return Template.getState('sessionDocs')
  }
})

Template.user.events({
  'click .info-icon' (event, templateInstance) {
    event.preventDefault()
    event.stopImmediatePropagation()
    templateInstance.$(event.currentTarget).closest('.flip-card-inner').toggleClass('flip')
  }
})
