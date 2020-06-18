import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import { BlazeBootstrap } from '../../../api/blazebootstrap/BlazeBootstrap'
import { bbsComponentLoader } from '../../utils/bbsComponentLoader'
import { Session } from '../../../api/session/Session'
<<<<<<< HEAD
=======
import { MyCourses } from '../../../api/collections/MyCourses'
>>>>>>> 595f33fa29660f5efcc896712eb5f1f2c13a6686
import './myClasses.html'
import './scss/myClasses.scss'

Template.myClasses.onCreated(function () {
  if (Session.currentClass()) {
    Session.currentClass(null)
  }
  if (Session.currentParticipant()) {
    Session.currentParticipant(null)
  }
  this.value = new ReactiveVar([1])
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
  },

  addField () {
    const template = Template.instance()
    return template.value.get()
  }
})

Template.myClasses.events({
  'click #addNewParticipant' (event, templateInstance) {
    // Prevent default browser form submit
<<<<<<< HEAD
    // event.preventDefault()
    console.log(templateInstance.value.get().push(2))
    templateInstance.value.set(templateInstance.value.get())
=======
    event.preventDefault()
>>>>>>> 595f33fa29660f5efcc896712eb5f1f2c13a6686
    // const text = templateInstance.$('#course-name').val()
  }
})
