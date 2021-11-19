import { Template } from 'meteor/templating'
import { State } from '../../../api/session/State'
import { Course } from '../../../contexts/courses/Course'
import { classExists } from '../../utils/classExists'
import { userExists } from '../../utils/userExists'
import { CompetencyCategory } from '../../../contexts/content/competency/CompetencyCategory'
import { Competency } from '../../../contexts/content/competency/Competency'
import { Dimension } from '../../../contexts/content/dimension/Dimension'
import './user.scss'
import './user.html'

Template.user.onCreated(function () {
  const instance = this

  instance.init({
    contexts: [Course, Competency, Dimension],
    onComplete() {
      instance.state.set('initComplete', true)
    }
  })

  instance.autorun(() => {
    const data = Template.currentData()
    const { classId } = data.params
    const currentClass = State.currentClass()

    if (classExists(classId) && currentClass !== classId) {
      State.currentClass(classId)
    }

    const { userId } = data.params
    const currentUser = State.currentParticipant()

    if (userExists(userId) && currentUser !== userId) {
      State.currentParticipant(userId)
    }
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
  }
})

Template.user.events({
  'click .info-icon' (event, templateInstance) {
    event.preventDefault()
    event.stopImmediatePropagation()
    templateInstance.$(event.currentTarget).closest('.flip-card-inner').toggleClass('flip')
  }
})
