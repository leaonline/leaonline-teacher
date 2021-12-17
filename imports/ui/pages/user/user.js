import { Template } from 'meteor/templating'
import { Course } from '../../../contexts/courses/Course'
import { User } from '../../../contexts/users/User'
import { OtuLea } from '../../../api/remotes/OtuLea'
import { State } from '../../../api/session/State'
import { AlphaLevel } from '../../../contexts/content/alphalevel/AlphaLevel'
import { CompetencyCategory } from '../../../contexts/content/competency/CompetencyCategory'
import { Competency } from '../../../contexts/content/competency/Competency'
import { Dimension } from '../../../contexts/content/dimension/Dimension'
import { callMethod } from '../../../infrastructure/methods/callMethod'
import { denormalizeFeedback } from '../../../api/feedback/denormalizeFeedback'
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
    State.currentParticipant(userId)

    // if we selected the participant from the course/class then we
    // should update the sidebarState
    const classId = data.queryParams.class || null
    State.currentClass(classId)

    // if we selected a specific session
    // then we need the id for further filtering
    const sessionId = data.queryParams.session || null

    callMethod({
      name: User.methods.get,
      args: { _id: userId },
      failure: instance.api.notify,
      success (userDoc) {
        instance.state.set({ userDoc, sessionId })
      }
    })
  })

  // for gathering the data we create a two-step process:
  // 1. get all sessions by dimension and provide a select component
  // 2. load the feedback doc(s) for the selected session or all sessions

  instance.autorun(() => {
    const userDoc = instance.state.get('userDoc')

    // we can only continue if we have loaded the current user doc
    // and the remote is connected AND logged-in
    if (!userDoc || !OtuLea.isLoggedIn()) { return }

    // load all feedbacks from all dimensions here for full-access
    OtuLea.getFeedback({ users: [userDoc.account._id], addSession: true })
      .catch(instance.api.notify)

      // we create a fallback to display in case no feedbacks are available
      .then(({ feedbackDocs = [], sessionDocs = [] }) => {
        instance.state.set({ feedbackDocs, sessionDocs })

        if (feedbackDocs.length === 0) {
          return instance.state.set('noData', true)
        }

        return  denormalizeFeedback({ feedback: feedbackDocs })
      })

      // if we have denormalized feedback we load the respective alpha-levels
      .then((processed) => {
        if (!processed) { return }

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

      // if we have denormalized feedback we load the respective competencies
      .then((processed) => {
        if (!processed) { return }

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
  sessionDocs () {
    return Template.getState('sessionDocs')
  },
  noData () {
    return Template.getState('noData')
  },
  user () {
    return Template.getState('userDoc')
  }
})

Template.user.events({
  'click .info-icon' (event, templateInstance) {
    event.preventDefault()
    event.stopImmediatePropagation()
    templateInstance.$(event.currentTarget).closest('.flip-card-inner').toggleClass('flip')
  }
})
