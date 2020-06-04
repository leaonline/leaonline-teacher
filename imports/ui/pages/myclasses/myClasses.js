import { Template } from 'meteor/templating'
import { BlazeBootstrap } from '../../../api/blazebootstrap/BlazeBootstrap'
import { bbsComponentLoader } from '../../utils/bbsComponentLoader'
import { Session } from '../../../api/session/Session'
import { MyCourses } from '../../../api/collections/MyCourses'
import './myClasses.html'
import './scss/myClasses.scss'

Template.myClasses.onCreated(function () {
  if (Session.currentClass()) {
    Session.currentClass(null)
  }
  if (Session.currentParticipant()) {
    Session.currentParticipant(null)
  }
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

Template.myClasses.helpers({
  componentsLoaded () {
    return componentsLoaded.get()
  },
  runningCourses () {
    const cursor = MyCourses.find({ startedAt: { $exists: true }, completedAt: { $exists: false } })
    if (cursor.count() === 0) return null
    return cursor
  },
  completedCourses () {
    const cursor = MyCourses.find({ startedAt: { $exists: true }, completedAt: { $exists: true } })
    if (cursor.count() === 0) return null
    return cursor
  },
  notStartedCourses () {
    const cursor = MyCourses.find({ startedAt: { $exists: false }, completedAt: { $exists: false } })
    if (cursor.count() === 0) return null
    return cursor
  }
})

Template.myClasses.events({
  'click .save-changes' (event, templateInstance) {
    // Prevent default browser form submit
    event.preventDefault()
    // const text = templateInstance.$('#course-name').val()
  }
})
