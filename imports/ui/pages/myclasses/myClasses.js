import { Template } from 'meteor/templating'
import { BlazeBootstrap } from '../../../api/blazebootstrap/BlazeBootstrap'
import { State } from '../../../api/session/State'
import { Course } from '../../../contexts/courses/Course'
import { User } from '../../../contexts/users/User'
import { Form } from '../../../api/form/Form'
import { Schema } from '../../../api/schema/Schema'
import { OtuLea } from '../../../api/remotes/OtuLea'
import { bbsComponentLoader } from '../../utils/bbsComponentLoader'
import { reactiveTranslate } from '../../../api/i18n/reactiveTranslate'
import { dataTarget } from '../../utils/dataTarget'
import { callMethod } from '../../../infrastructure/methods/callMethod'
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

const Types = {
  course: {
    name: 'course',
    label: 'pages.myClasses.types.course',
    collection: () => Course.collection(),
    schema: Schema.create(Course.schema(reactiveTranslate)),
    context: Course
  },
  user: {
    name: 'user',
    label: 'pages.myClasses.types.user',
    collection: () => User.collection(),
    schema: Schema.create(User.schema(reactiveTranslate)),
    context: User
  }
}

const byName = (a, b) =>
  (2 * (a.lastName || '').localeCompare(b.lastName || '')) +
  (a.firstName || '').localeCompare(b.firstName || '')

Template.myClasses.onCreated(function () {
  const instance = this
  instance.init({
    contexts: [Course, User],
    useLanguage: [myClassesLanguages],
    remotes: [OtuLea],
    onComplete () {
      instance.state.set('initComplete', true)
    },
    onError (err) {
      instance.api.notify(err)
    },
    debug: true
  })

  instance.api.subscribe({
    name: Course.publications.my.name,
    onReady: () => instance.state.set('coursePublicationComplete', true)
  })

  instance.api.subscribe({
    name: User.publications.my.name,
    onReady: () => instance.state.set('userPublicationComplete', true)
  })

  if (State.currentClass()) {
    State.currentClass(null)
  }
  if (State.currentParticipant()) {
    State.currentParticipant(null)
  }

  const now = new Date()
  const activeCoursesQuery = { completesAt: { $gte: now } }
  const archivedCoursesQuery = { completesAt: { $lt: now } }

  instance.autorun(() => {
    const activeUsers = new Map()
    const archivedUsers = new Map()

    // first we go through all active courses and find their users
    Course.collection()
      .find(activeCoursesQuery)
      .forEach(doc => {
        if (!doc.users?.length) { return }

        // found users will get linked with the courses so we don't
        // have to do this on DB-Level or in the templates
        User.collection().find({ _id: { $in: doc.users } }).forEach(userDoc => {
          if (!activeUsers.has(userDoc._id)) {
            userDoc.courses = []
            activeUsers.set(userDoc._id, userDoc)
          }

          const cachedUserDoc = activeUsers.get(userDoc._id)
          cachedUserDoc.courses.push(doc)
          activeUsers.set(userDoc._id, cachedUserDoc)
        })
      })

    // then we go through all archived courses
    Course.collection()
      .find(archivedCoursesQuery)
      .forEach(doc => {
        if (!doc.users?.length) { return }

        // found users need to be second-checked against active users
        // because we only want to show them in archived if they do not appear
        // in active courses
        User.collection().find({ _id: { $in: doc.users } }).forEach(userDoc => {
          if (activeUsers.has(userDoc._id)) { return }

          if (!archivedUsers.has(userDoc._id)) {
            userDoc.courses = []
            archivedUsers.set(userDoc._id, userDoc)
          }

          const cachedUserDoc = archivedUsers.get(userDoc._id)
          cachedUserDoc.courses.push(doc)
          archivedUsers.set(userDoc._id, cachedUserDoc)
        })
      })

    // additionally find users that have no courses at all
    User.collection()
      .find()
      .forEach(userDoc => {
        if (Course.collection().find({ users: userDoc._id }).count() === 0) {
          // this should never occur
          if (activeUsers.has(userDoc._id)) {
            throw new Error(`Unexpected: user ${userDoc._id} should not be in a course`)
          }

          activeUsers.set(userDoc._id, userDoc)
        }
      })

    instance.state.set({
      activeUsers: Array.from(activeUsers.values()).sort(byName),
      archivedUsers: Array.from(archivedUsers.values()).sort(byName)
    })
  })

  instance.autorun(() => {
    const activeUsers = instance.state.get('activeUsers')
    if (!activeUsers?.length || !OtuLea.isLoggedIn()) { return }

    const users = activeUsers.map(userDoc => userDoc.account?._id)

    OtuLea.recentFeedback({ users })
      .catch(instance.api.notify)
      .then((sessionDocs) => {
        if (!sessionDocs) { return }

        const recentFeedback = sessionDocs.map(session => {
          const user = User.collection().findOne({ 'account._id': session.userId })
          return { session, user }
        })
        instance.state.set({ recentFeedback })
      })
  })
})

Template.myClasses.onDestroyed(function () {
  const instance = this
  instance.api.destroy()
})

Template.myClasses.helpers({
  dataComplete () {
    return Template.getState('coursePublicationComplete') &&
      Template.getState('userPublicationComplete')
  },
  componentsLoaded () {
    return componentsLoader.loaded.get() &&
      formLoaded.get() &&
      Template.getState('initComplete')
  },
  activeCourses () {
    const now = new Date()
    const query = { completesAt: { $gte: now } }
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
  noCourses () {
    return Course.collection().find().count() === 0
  },
  activeUsers () {
    return Template.getState('activeUsers')
  },
  archivedUsers () {
    return Template.getState('archivedUsers')
  },
  insertSchema () {
    const type = Template.getState('type')
    return type && Types[type].schema
  },
  formAction (name) {
    return Template.getState('action') === name
  },
  isType (name) {
    return Template.getState('type') === name
  },
  typeLabel () {
    const type = Types[Template.getState('type')]
    return type?.label
  },
  getCollection () {
    return Course.collection()
  },
  editFormDoc () {
    return Template.getState('doc')
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
  },
  waiting () {
    return Template.getState('waiting')
  },
  recentFeedback () {
    return Template.getState('recentFeedback')
  }
})

Template.cardItems.helpers({
  isRunning (courseDoc = {}) {
    const now = Date.now()
    const starts = new Date(courseDoc.startsAt).getTime()
    return starts < now
  },
  isComplete (courseDoc = {}) {
    const now = Date.now()
    const ends = new Date(courseDoc.completesAt).getTime()
    return ends < now
  }
})

Template.myClasses.events({
  'submit #insertForm' (event, templateInstance) {
    event.preventDefault()

    const type = Types[templateInstance.state.get('type')]
    const insertDoc = Form.getFormValues({
      formId: 'insertForm',
      schema: type.schema
    })

    if (!insertDoc) return

    callMethod({
      name: type.context.methods.insert,
      args: insertDoc,
      prepare: () => templateInstance.state.set('waiting', true),
      receive: () => templateInstance.state.set('waiting', false),
      failure: templateInstance.api.notify,
      success: insertDocId => {
        templateInstance.api.debug('inserted', insertDocId)
        templateInstance.api.hideModal('form-modal')
      }
    })
  },
  'submit #updateForm' (event, templateInstance) {
    event.preventDefault()

    const type = Types[templateInstance.state.get('type')]
    const updateDoc = Form.getFormValues({
      formId: 'updateForm',
      schema: type.schema,
      isUpdate: true
    })

    if (!updateDoc) return

    const currentDoc = templateInstance.state.get('doc')
    updateDoc._id = currentDoc._id

    callMethod({
      name: type.context.methods.update,
      args: updateDoc,
      prepare: () => templateInstance.state.set('waiting', true),
      receive: () => templateInstance.state.set('waiting', false),
      failure: templateInstance.api.notify,
      success: updated => {
        if (updated) {
          templateInstance.api.notify(true)
        }
        templateInstance.api.debug('updated', currentDoc._id, !!updated)
        templateInstance.api.hideModal('form-modal')
      }
    })
  },
  'click .delete-button' (event, templateInstance) {
    event.preventDefault()

    const type = Types[templateInstance.state.get('type')]
    const currentDoc = templateInstance.state.get('doc')

    callMethod({
      name: type.context.methods.remove,
      args: { _id: currentDoc._id },
      prepare: () => templateInstance.state.set('waiting', true),
      receive: () => templateInstance.state.set('waiting', false),
      failure: templateInstance.api.notify,
      success: removed => {
        templateInstance.api.debug('removed', currentDoc._id, !!removed)
        templateInstance.api.hideModal('form-modal')
        if (removed) {
          templateInstance.api.notify(true)
        }
      }
    })
  },
  'click .modal-trigger' (event, templateInstance) {
    event.preventDefault()

    const action = dataTarget(event)
    const type = dataTarget(event, 'type')
    const docId = dataTarget(event, 'id')

    let doc = null
    if (docId) {
      doc = Types[type].collection().findOne(docId)
    }

    templateInstance.state.set({ type, doc, action })
    templateInstance.api.showModal('form-modal')
  },
  'hidden.bs.modal' (event, templateInstance) {
    const targetId = event.target.id
    Form.reset(targetId)
    templateInstance.state.set({
      addUserCode: null,
      type: null,
      action: null,
      doc: null
    })
  }
})
