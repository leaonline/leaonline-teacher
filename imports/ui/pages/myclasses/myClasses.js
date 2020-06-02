import { Template } from 'meteor/templating'
import { BlazeBootstrap } from '../../../api/blazebootstrap/BlazeBootstrap'
import { bbsComponentLoader } from '../../utils/bbsComponentLoader'
import { Session } from '../../../api/session/Session'
import { exampleDataRunningCourses, exampleDataNotStartedCourses, exampleDataCompletedCourses } from '../../../startup/client/exampleDataCollection'
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
    return exampleDataRunningCourses.find({}).fetch()
  },
  completedCourses () {
    return exampleDataCompletedCourses.find({}).fetch()
  },
  notStartedCourses () {
    return exampleDataNotStartedCourses.find({}).fetch()
  }
})

Template.myClasses.events({
  'click .save-changes' (event, templateInstance) {
    // Prevent default browser form submit
    event.preventDefault()
    const text = templateInstance.$('#course-name').val()
  }
})
