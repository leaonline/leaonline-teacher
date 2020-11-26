import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { BlazeBootstrap } from '../../../api/blazebootstrap/BlazeBootstrap'
import { bbsComponentLoader } from '../../utils/bbsComponentLoader'
import { Session } from '../../../api/session/Session'
import { MyCourses } from '../../../api/collections/MyCourses'
import { AutoFormBootstrap4 } from 'meteor/jkuester:autoform-bootstrap4'
import { AutoForm } from 'meteor/aldeed:autoform'
import { Schema } from '../../../api/schema/Schema'
import { transformUpdateDoc } from '../../utils/form/transformUpdateDoc'
import { formIsValid } from '../../utils/form/formIsValid'
import { resetForm } from '../../utils/form/resetForm'
import './myClasses.html'
import './scss/myClasses.scss'
import { cleanUpdateDoc } from '../../utils/form/cleanUpdateDoc'

Template.myClasses.onCreated(function () {
  if (Session.currentClass()) {
    Session.currentClass(null)
  }
  if (Session.currentParticipant()) {
    Session.currentParticipant(null)
  }
  this.courseDoc = new ReactiveVar(0)
})

AutoFormBootstrap4.load().then(() => console.log('AutoFormBootstrap4 loaded')).catch(e => console.error(e))

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

const isMongoDate = { $type: 9 }
const isNotMongoDate = { $not: isMongoDate }

Template.myClasses.helpers({
  componentsLoaded () {
    return componentsLoaded.get()
  },
  runningCourses () {
    const query = { startedAt: isMongoDate, completedAt: isNotMongoDate }
    const transform = { sort: { startedAt: -1 } }
    const cursor = MyCourses.collection().find(query, transform)
    if (cursor.count() === 0) return null
    return cursor
  },
  completedCourses () {
    const query = { startedAt: isMongoDate, completedAt: isMongoDate }
    const transform = { sort: { completedAt: -1 } }
    const cursor = MyCourses.collection().find(query, transform)
    if (cursor.count() === 0) return null
    return cursor
  },
  notStartedCourses () {
    const query = {}
    query.startedAt = isNotMongoDate
    query.completedAt = isNotMongoDate
    const transform = { sort: { title: -1 } }
    const cursor = MyCourses.collection().find(query, transform)
    if (cursor.count() === 0) return null
    return cursor
  },

  addField () {
    const template = Template.instance()
    return template.courseDoc.get()
  },
  courseSchema () {
    return courseSchema
  },
  getCollection () {
    return collection
  },
  getClickedCourse () {
    return Template.instance().courseDoc.get()
  },
  getEntryRoute () {
    return Template.instance().data.getEntryRoute()
  }
})

Template.myClasses.events({
  'submit #insertCourseForm' (event, templateInstance) {
    event.preventDefault()
    const formValues = AutoForm.getFormValues('insertCourseForm')
    MyCourses.api.insert(formValues.insertDoc)
    templateInstance.$('#add-course-modal').modal('hide')
  },
  'click .update-course' (event, templateInstance) {
    event.preventDefault()
    const courseId = templateInstance.$(event.currentTarget).data('course')
    const clickedCourseData = MyCourses.collection().findOne(courseId)
    templateInstance.courseDoc.set(clickedCourseData)
  },
  'submit #editCourseForm' (event, templateInstance) {
    event.preventDefault()
    const updateDoc = formIsValid('editCourseForm', courseSchema, { isUpdate: true })
    if (!updateDoc) return
    const courseDoc = templateInstance.courseDoc.get()
    const transformedDoc = transformUpdateDoc(updateDoc)
    const cleanedDoc = cleanUpdateDoc(transformedDoc, courseDoc)
    MyCourses.api.update(courseDoc._id, cleanedDoc)

    templateInstance.$('#edit-course-modal').modal('hide')
  },
  'click .delete-course-icon' (event, templateInstance) {
    event.preventDefault()
    const courseId = templateInstance.$(event.currentTarget).data('course')
    const clickedCourseData = MyCourses.collection().findOne(courseId)
    templateInstance.courseDoc.set(clickedCourseData)
    templateInstance.$('#delete-course-modal').modal('show')
  },
  'click .delete-course-button' (event, templateInstance) {
    event.preventDefault()
    const courseDoc = templateInstance.courseDoc.get()
    MyCourses.api.remove(courseDoc._id)
    templateInstance.$('#delete-course-modal').modal('hide')
  },
  'hidden.bs.modal #edit-course-modal' () {
    resetForm('editCourseForm')
  }
})
