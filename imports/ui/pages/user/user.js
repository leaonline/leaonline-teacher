import { Template } from 'meteor/templating'
import { State } from '../../../api/session/State'
import { classExists } from '../../utils/classExists'
import { userExists } from '../../utils/userExists'
import { CompetencyCategory } from '../../../contexts/content/competency/CompetencyCategory'
import { Competency } from '../../../contexts/content/competency/Competency'
// import { Schema } from '../../../api/schema/Schema'
import { bbsComponentLoader } from '../../utils/bbsComponentLoader'
import { BlazeBootstrap } from '../../../api/blazebootstrap/BlazeBootstrap'
import './user.html'
import './scss/user.scss'

Template.user.onCreated(function () {
  const instance = this
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

const componentsLoader = bbsComponentLoader([
  BlazeBootstrap.link.load(),
  BlazeBootstrap.button.load(),
  BlazeBootstrap.listgroup.load(),
  BlazeBootstrap.item.load(),
  BlazeBootstrap.card.load(),
  BlazeBootstrap.badge.load(),
  BlazeBootstrap.modal.load()
])

const componentsLoaded = componentsLoader.loaded
// const competencyCategoriesSchema = Schema.create(CompetencyCategories.schema)

Template.user.helpers({
  componentsLoaded () {
    return componentsLoaded.get()
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
