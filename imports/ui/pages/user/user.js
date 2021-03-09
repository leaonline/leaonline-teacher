import { Template } from 'meteor/templating'
import { Session } from '../../../api/session/Session'
import { classExists } from '../../utils/classExists'
import { userExists } from '../../utils/userExists'
import { CompetencyCategories } from '../../../api/collections/competencyCategories'
import { Competency } from '../../../api/collections/competency'
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
    const currentClass = Session.currentClass()

    if (classExists(classId) && currentClass !== classId) {
      Session.currentClass(classId)
    }

    const { userId } = data.params
    const currentUser = Session.currentParticipant()

    if (userExists(userId) && currentUser !== userId) {
      Session.currentParticipant(userId)
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
// const collection = CompetencyCategories.collection()

const cursor = CompetencyCategories.collection().find({}, { fields: { title: 0 } }).fetch()
console.log(cursor)

const competency = Competency.collection().find().fetch()

cursor.forEach(function (cursorDoc) {
  competency.forEach(function (document) {
    Competency.collection().update(document._id, { $set: { competencyCategory: cursorDoc._id } })
  })
})

console.log(Competency.collection().find().fetch())

Template.user.helpers({
  componentsLoaded () {
    return componentsLoaded.get()
  },
  competencyCategories () {
    const cursor = CompetencyCategories.collection().find()
    // console.log(cursor.fetch())
    if (cursor.count() === 0) return null
    return cursor
  },
  competencies () {
    const cursor = Competency.collection().find()
    // console.log(cursor.fetch())
    if (cursor.count() === 0) return null
    return cursor
  }
})

Template.user.events({
  'click .info-icon' (event, templateInstance) {
    event.preventDefault()
    event.stopImmediatePropagation()
    templateInstance.$(event.currentTarget).closest('.flip-card-inner').toggleClass('flip')
  }
})
