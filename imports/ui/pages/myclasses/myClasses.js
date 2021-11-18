import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { Random } from 'meteor/random'
import { BlazeBootstrap } from '../../../api/blazebootstrap/BlazeBootstrap'
import { State } from '../../../api/session/State'
import { Course } from '../../../contexts/courses/Course'
import { Form } from '../../../api/form/Form'
import { Schema } from '../../../api/schema/Schema'
import { OtuLea } from '../../../api/remotes/OtuLea'
import { bbsComponentLoader } from '../../utils/bbsComponentLoader'
import { reactiveTranslate } from '../../../api/i18n/reactiveTranslate'
import { dataTarget } from '../../utils/dataTarget'
import { generateUser } from '../../../api/accounts/generateUser'
import myClassesLanguages from './i18n/myClassesLanguages'
import './myClasses.html'
import './scss/myClasses.scss'

const componentsLoader = bbsComponentLoader([
  BlazeBootstrap.link.load(),
  BlazeBootstrap.button.load(),
  BlazeBootstrap.listgroup.load(),
  BlazeBootstrap.item.load(),
  BlazeBootstrap.card.load(),
  BlazeBootstrap.badge.load(),
  BlazeBootstrap.modal.load()
])

const formLoaded = Form.initialize()
const courseSchemaDef = Course.schema(reactiveTranslate)
delete courseSchemaDef.startedAt
delete courseSchemaDef.completedAt

const courseSchema = Schema.create(courseSchemaDef)
const byName = (a, b) =>
  (2 * (a.lastName || '').localeCompare(b.lastName || '')) +
  (a.firstName || '').localeCompare(b.firstName || '')

Template.myClasses.onCreated(function () {
  const instance = this

  instance.init({
    contexts: [Course],
    useLanguage: [myClassesLanguages],
    remotes: [OtuLea],
    onComplete () {
      instance.state.set('initComplete', true)
    }
  })

  if (State.currentClass()) {
    State.currentClass(null)
  }
  if (State.currentParticipant()) {
    State.currentParticipant(null)
  }

  instance.autorun(() => {
    const sub = instance.subscribe(Course.publications.my.name)
    if (sub.ready()) {
      instance.state.set({ coursePublicationComplete: true })
    }
  })

  instance.autorun(() => {
    const allUsers = new Set()
    Course.collection()
      .find()
      .forEach(doc => {
        (doc.users || []).forEach((user, index) => {
          user.courseId = doc._id
          user.index = index
          allUsers.add(user)
        })
      })
    instance.state.set('activeUsers', Array.from(allUsers).sort(byName))
  })

  this.courseDoc = new ReactiveVar(0)
})

Template.myClasses.helpers({
  dataComplete () {
    return Template.getState('coursePublicationComplete')
  },
  componentsLoaded () {
    return componentsLoader.loaded.get() &&
      formLoaded.get() &&
      Template.getState('initComplete')
  },
  runningCourses () {
    const now = new Date()
    const query = { startsAt: { $lte: now }, completesAt: { $gte: now } }
    const transform = { sort: { startsAt: -1 } }
    const cursor = Course.collection().find(query, transform)
    if (cursor.count() === 0) return null
    return cursor
  },
  completedCourses () {
    const now = new Date()
    const query = { completesAt: { $lt: now } }
    const transform = { sort: { completesAt: -1 } }
    const cursor = Course.collection().find(query, transform)
    if (cursor.count() === 0) return null
    return cursor
  },
  notStartedCourses () {
    const now = new Date()
    const query = { startsAt: { $gt: now } }
    const transform = { sort: { title: -1 } }
    const cursor = Course.collection().find(query, transform)
    if (cursor.count() === 0) return null
    return cursor
  },
  noCourses () {
    return Course.collection().find().count() === 0
  },
  activeUsers () {
    return Template.getState('activeUsers')
  },
  addField () {
    const template = Template.instance()
    return template.courseDoc.get()
  },
  courseSchema () {
    return courseSchema
  },
  getCollection () {
    return Course.collection()
  },
  getClickedCourse () {
    return Template.instance().courseDoc.get()
  },
  getEntryRoute () {
    return Template.instance().data.getEntryRoute()
  },
  getUserRoute () {
    return Template.instance().data.getUserRoute()
  },
  getCourse (id) {
    return Course.collection().findOne(id)
  },
  generatingCode () {
    return Template.getState('generatingCode')
  }
})

Template.myClasses.events({
  'submit #insertCourseForm' (event, templateInstance) {
    event.preventDefault()

    const insertDoc = Form.getFormValues({
      formId: 'insertCourseForm',
      schema: courseSchema
    })

    if (!insertDoc) return

    ;(insertDoc.users || []).forEach(user => {
      user._id = Random.id()
    })

    Course.api.insert(insertDoc)
      .then(insertDocId => {
        templateInstance.api.debug('inserted', insertDocId)
        templateInstance.$('#add-course-modal').modal('hide')
      })
      .catch(e => console.error(e))
  },
  'click .update-course' (event, templateInstance) {
    event.preventDefault()
    const courseId = templateInstance.$(event.currentTarget).data('course')
    const clickedCourseData = Course.collection().findOne(courseId)
    templateInstance.courseDoc.set(clickedCourseData)
  },
  'submit #editCourseForm' (event, templateInstance) {
    event.preventDefault()

    const updateDoc = Form.getFormValues({
      formId: 'editCourseForm',
      schema: courseSchema,
      isUpdate: true
    })

    if (!updateDoc) return
    const courseDoc = templateInstance.courseDoc.get()
    updateDoc._id = courseDoc._id
    Course.api.update(updateDoc)
      .catch(e => console.error(e))
      .then(updated => {
        templateInstance.api.debug('updated', courseDoc._id, !!updated)
        templateInstance.$('#edit-course-modal').modal('hide')
      })
  },
  'click .delete-course-icon' (event, templateInstance) {
    event.preventDefault()
    const courseId = templateInstance.$(event.currentTarget).data('course')
    const clickedCourseData = Course.collection().findOne(courseId)
    templateInstance.courseDoc.set(clickedCourseData)
    templateInstance.$('#delete-course-modal').modal('show')
  },
  'click .delete-course-button' (event, templateInstance) {
    event.preventDefault()
    const courseDoc = templateInstance.courseDoc.get()
    Course.api.remove(courseDoc._id)
      .then(removed => {
        templateInstance.api.debug('removed', courseDoc._id, !!removed)
        templateInstance.$('#delete-course-modal').modal('hide')
      })
      .catch(e => console.error(e))
  },
  'hidden.bs.modal' (event, templateInstance) {
    const targetId = event.target.id
    Form.reset(targetId)
    templateInstance.state.set('addUserCode', null)
  },
  'click .add-usercode-button': async function (event, templateInstance) {
    event.preventDefault()
    templateInstance.state.set('generating', true)
    const userIndex = dataTarget(event, 'user')
    const courseId = dataTarget(event, 'course')
    const courseDoc = Course.collection().findOne(courseId)
    const userDoc = await generateUser()
    templateInstance.api.debug({ userDoc })
    const updateDoc = {
      _id: courseId,
      $set: {
        [`users.${userIndex}._id`]: userDoc._id,
        [`users.${userIndex}.code`]: userDoc.username
      }
    }

    await Course.api.update(updateDoc)
    templateInstance.api.debug('updated', courseDoc._id)

    templateInstance.state.set('generating', false)
  }
})
