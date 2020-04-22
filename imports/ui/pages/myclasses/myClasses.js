import { Template } from 'meteor/templating'
import { Session } from '../../../api/session/Session'
import './myClasses.html'

Template.myClasses.onCreated(function () {
  if (Session.currentClass()) {
    Session.currentClass(null)
  }
  if (Session.currentParticipant()) {
    Session.currentParticipant(null)
  }
})
