import { Template } from 'meteor/templating'
import { Course } from '../../../contexts/courses/Course'
import { User } from '../../../contexts/users/User'
import { OtuLea } from '../../../api/remotes/OtuLea'
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
  },
  noData () {
    return Template.getState('noData')
  }
})

Template.user.events({
  'click .info-icon' (event, templateInstance) {
    event.preventDefault()
    event.stopImmediatePropagation()
    templateInstance.$(event.currentTarget).closest('.flip-card-inner').toggleClass('flip')
  }
})
