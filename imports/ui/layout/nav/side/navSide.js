import { Template } from 'meteor/templating'
import { BlazeBootstrap } from '../../../../api/blazebootstrap/BlazeBootstrap'
import { bbsComponentLoader } from '../../../utils/bbsComponentLoader'
import { State } from '../../../../api/session/State'
import './navSide.scss'
import './navSide.html'

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
  },
  hidden () {
    return Template.getState('hidden')
  }
})

Template.navSide.events({
  'click .sidebar-left-toggle' (event, templateInstance) {
    const hidden = templateInstance.state.get('hidden')
    templateInstance.state.set('hidden', !hidden)
  }
})
