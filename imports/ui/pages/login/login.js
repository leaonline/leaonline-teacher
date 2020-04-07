import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { loggedIn } from '../../../api/utils/accountUtils'
import './login.html'

const states = {
  login: 'login',
  loggedIn: 'loggedIn'
}

Template.login.onCreated(function () {
  const instance = this
  instance.autorun(() => {
    const view = instance.state.get('view')

    // if logged in we display a logged in state but do nothing
    // further, because the router's trigger should act on this
    if (loggedIn()) {
      return instance.state.set('view', states.loggedIn)
    }
    if (!view) {
      instance.state.set('view', states.login)
    }
  })
})

Template.login.helpers({
  loginError () {
    return Template.getState('loginError')
  },
  login (name) {
    return Template.getState('view') === states.login
  },
  loggedIn () {
    const instance = Template.instance()
    return instance.state.get('view') === states.loggedIn && !instance.state.get('loggingIn')
  },
  loggingIn () {
    return Template.getState('loggingIn')
  }
})

Template.login.events({
  'click .login-button' (event, templateInstance) {
    event.preventDefault()

    templateInstance.state.set('loggingIn', true)

    // we set the template to a 'logginIn' (waiting) state
    // and login using our custom oauth2 service provider
    Meteor.loginWithLea((err, res) => {
      templateInstance.state.set('loggingIn', false)
      if (err) {
        return templateInstance.state.set('loginError', err)
      }

      templateInstance.data.onSuccess(res)
    })
  }
})
