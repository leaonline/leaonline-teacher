import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { BlazeBootstrap } from '../../../api/blazebootstrap/BlazeBootstrap'
import { bbsComponentLoader } from '../../utils/bbsComponentLoader'
import { loggedOut } from '../../../api/utils/accountUtils'
import './logout.html'

const componentsLoader = bbsComponentLoader([
  BlazeBootstrap.alert.load()
])
const componentsLoaded = componentsLoader.loaded
const states = {
  loggedOut: 'loggedOut',
  loggingOut: 'loggingOut',
  hasError: 'hasError'
}

Template.logout.onCreated(function () {
  const instance = this

  // no need to log out again
  // if already logged out
  if (loggedOut()) {
    return onLoggedOut(instance)
  }

  Meteor.logout(error => {
    if (error) {
      instance.state.set({
        view: states.hasError,
        error: error
      })
    } else {
      onLoggedOut(instance)
    }
  })
})

Template.logout.helpers({
  loadComplete () {
    return componentsLoaded.get()
  },
  loggingOut () {
    return Template.getState('view') === states.loggingOut
  },
  loggedOut () {
    return Template.getState('view') === states.loggedOut
  },
  hasError () {
    return Template.getState('view') === states.hasError
  },
  error () {
    return Template.getState('error')
  }
})

function onLoggedOut (templateInstance) {
  templateInstance.state.set('view', states.loggedOut)
  setTimeout(() =>  {
    templateInstance.data.onSuccess()
  }, 1000)
}
