import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { BlazeBootstrap } from '../../../api/blazebootstrap/BlazeBootstrap'
import { bbsComponentLoader } from '../../utils/bbsComponentLoader'
import { Session } from '../../../api/session/Session'
import { MyCourses } from '../../../api/collections/MyCourses'
import { AutoFormBootstrap4 } from 'meteor/jkuester:autoform-bootstrap4'
import './myClasses.html'
import './scss/myClasses.scss'
import { Schema } from '../../../api/schema/Schema'

Template.myClasses.onCreated(function () {
  if (Session.currentClass()) {
    Session.currentClass(null)
  }
  if (Session.currentParticipant()) {
    Session.currentParticipant(null)
  }
  this.value = new ReactiveVar([0])
})

AutoFormBootstrap4.load().then(() => console.log('hello')).catch(e => console.error(e))

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
const courseSchema = Schema.create(MyCourses.schema)

Template.myClasses.helpers({
  componentsLoaded () {
    return componentsLoaded.get()
  },
  runningCourses () {
    const cursor = MyCourses.collection().find({ startedAt: { $exists: true }, completedAt: { $exists: false } })
    if (cursor.count() === 0) return null
    return cursor
  },
  completedCourses () {
    const cursor = MyCourses.collection().find({ startedAt: { $exists: true }, completedAt: { $exists: true } })
    if (cursor.count() === 0) return null
    return cursor
  },
  notStartedCourses () {
    const cursor = MyCourses.collection().find({ startedAt: { $exists: false }, completedAt: { $exists: false } })
    if (cursor.count() === 0) return null
    return cursor
  },

  addField () {
    const template = Template.instance()
    return template.value.get()
  },
  courseSchema () {
    return courseSchema
  },
  getClickedCourse () {

  }
})

let a = null

Template.myClasses.events({
  'click #addNewParticipant' (event, templateInstance) {
    // Prevent default browser form submit
    // event.preventDefault()
    // console.log(templateInstance.value.get().push(2))
    templateInstance.value.set(templateInstance.value.get())
    const text = templateInstance.$('#course-name').val()
  },
  'submit #insertCourseForm' (event, templateInstance) {
    event.preventDefault()
    const formValues = AutoForm.getFormValues('insertCourseForm')
    console.log(formValues)
    MyCourses.api.insert(formValues.insertDoc)
  },

  'click .update-course' (event, templateInstance) {
    event.preventDefault()
    a = event.target.parentElement.previousElementSibling.innerHTML
    console.log(a)
  }
})
