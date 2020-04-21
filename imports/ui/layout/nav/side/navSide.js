import { Template } from 'meteor/templating'
import { BlazeBootstrap } from '../../../../api/blazebootstrap/BlazeBootstrap'
import { bbsComponentLoader } from '../../../utils/bbsComponentLoader'
import { Session } from '../../../../api/session/Session'
import './navSide.html'
import './scss/navSlide.scss'
import { Router } from '../../../../api/routing/Router'

const componentsLoader = bbsComponentLoader([
  BlazeBootstrap.link.load(),
  BlazeBootstrap.button.load(),
  BlazeBootstrap.navbar.load(),
  BlazeBootstrap.nav.load()
])

const componentsLoaded = componentsLoader.loaded

Template.navSide.helpers({
  componentsLoaded () {
    console.log(Router.label())
    return componentsLoaded.get()
  },
  currentClass () {
    return Session.currentClass()
  },
  currentParticipant () {
    return Session.currentParticipant()
  },
  classRouteDisabled () {
    return !Session.currentClass()
  },
  userRouteDisabled () {
    return !Session.currentClass() || !Session.currentParticipant()
  }
})
