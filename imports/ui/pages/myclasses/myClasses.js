import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { BlazeBootstrap } from '../../../api/blazebootstrap/BlazeBootstrap'
import { bbsComponentLoader } from '../../utils/bbsComponentLoader'
import { Session } from '../../../api/session/Session'
import { MyCourses } from '../../../api/collections/MyCourses'
import { AutoFormBootstrap4 } from 'meteor/jkuester:autoform-bootstrap4'
import { AutoForm } from 'meteor/aldeed:autoform'
import './myClasses.html'
import './scss/myClasses.scss'
import { Schema } from '../../../api/schema/Schema'
import { transformUpdateDoc } from '../../../api/utils/transformUpdateDoc'

Template.myClasses.onCreated(function () {
  if (Session.currentClass()) {
    Session.currentClass(null)
  }
  if (Session.currentParticipant()) {
    Session.currentParticipant(null)
  }
  this.value = new ReactiveVar(0)
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
const collection = MyCourses.collection()

let clickedCourse = null

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
  getCollection () {
    return collection
  },
  getClickedCourse () {
    return Template.instance().value.get()
  }
})

Template.myClasses.events({
  // 'click #addNewParticipant' (event, templateInstance) {
  //   // Prevent default browser form submit
  //   // event.preventDefault()
  //   // console.log(templateInstance.value.get().push(2))
  //   templateInstance.value.set(templateInstance.value.get())
  //   const text = templateInstance.$('#course-name').val()
  // },
  'submit #insertCourseForm' (event, templateInstance) {
    event.preventDefault()
    const formValues = AutoForm.getFormValues('insertCourseForm')
    console.log(formValues)
    MyCourses.api.insert(formValues.insertDoc)
    templateInstance.$('#add-course-modal').modal('hide')
  },
  'click .update-course' (event, templateInstance) {
    event.preventDefault()
    const clickedCourseTitle = event.currentTarget.parentElement.previousElementSibling.innerHTML
    const clickedCourseData = MyCourses.collection().find({ title: clickedCourseTitle }).fetch()[0]
    console.log(clickedCourseData)
    templateInstance.value.set(clickedCourseData)
  },
  'submit #editCourseForm' (event, templateInstance) {
    event.preventDefault()
    const updateDocFormValues = AutoForm.getFormValues('editCourseForm')
    console.log(updateDocFormValues)
    const transformedDoc = transformUpdateDoc({ $set: updateDocFormValues.updateDoc.$set, $unset: updateDocFormValues.updateDoc.$unset })
    console.log(transformedDoc)
    MyCourses.api.update(templateInstance.value.get()._id, { $set: transformedDoc })
    templateInstance.$('#edit-course-modal').modal('hide')
  },
  'click .delete-course-icon' (event, templateInstance) {
    event.preventDefault()
    clickedCourse = event.currentTarget.parentElement.previousElementSibling.innerHTML
    templateInstance.$('#delete-course-modal').modal('show')
  },
  'click .delete-course-button' (event, templateInstance) {
    event.preventDefault()
    const clickedCourseData = MyCourses.collection().find({ title: clickedCourse }).fetch()[0]
    MyCourses.api.remove(clickedCourseData._id)
    templateInstance.$('#delete-course-modal').modal('hide')
  }
})
