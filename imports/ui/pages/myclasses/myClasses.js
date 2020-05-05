import { Template } from 'meteor/templating'
import { BlazeBootstrap } from '../../../api/blazebootstrap/BlazeBootstrap'
import { bbsComponentLoader } from '../../utils/bbsComponentLoader'
import { Session } from '../../../api/session/Session'
import en from '../../../../resources/i18n/en'
import './myClasses.html'

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
  BlazeBootstrap.card.load()
])

const componentsLoaded = componentsLoader.loaded

Template.myClasses.helpers({
  componentsLoaded () {
    return componentsLoaded.get()
  },
  runningCourses () {
    const runningCoursesArray = []
    const runningCoursesObject = en.courses.runningCourses
    for (const key in runningCoursesObject) {
      runningCoursesArray.push({ key: key, value: runningCoursesObject[key] })
    }
    return runningCoursesArray
  },
  completedCourses () {
    const completedCoursesArray = []
    const completedCoursesObject = en.courses.completedCourses
    for (const key in completedCoursesObject) {
      completedCoursesArray.push({ key: key, value: completedCoursesObject[key] })
    }
    return completedCoursesArray
  },
  notStartedCourses () {
    const notStartedArray = []
    const notStartedObject = en.courses.notStartedCourses
    for (const key in notStartedObject) {
      notStartedArray.push({ key: key, value: notStartedObject[key] })
    }
    return notStartedArray
  },
  noEntries () {
    return en.courses.noEntriesFound
  }
})
