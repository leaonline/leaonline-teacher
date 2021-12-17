import { Template } from 'meteor/templating'
import { BlazeBootstrap } from '../../../../api/blazebootstrap/BlazeBootstrap'
import { bbsComponentLoader } from '../../../utils/bbsComponentLoader'
import { State } from '../../../../api/session/State'
import './navSide.html'
import './scss/navSlide.scss'

const componentsLoader = bbsComponentLoader([
  BlazeBootstrap.link.load(),
  BlazeBootstrap.button.load(),
  BlazeBootstrap.navbar.load(),
  BlazeBootstrap.nav.load()
])

const componentsLoaded = componentsLoader.loaded

Template.navSide.helpers({
  componentsLoaded () {
    return componentsLoaded.get()
  },
  currentClass () {
    return State.currentClass()
  },
  currentParticipant () {
    return State.currentParticipant()
  },
  classRouteDisabled () {
    return !State.currentClass()
  },
  userRouteDisabled () {
    return !State.currentParticipant()
  }
})
