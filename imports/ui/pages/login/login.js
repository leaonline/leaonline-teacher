import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { loggedIn } from '../../../api/utils/accountUtils'
import loginLanguages from './i18n/loginLanguages'
import '../../components/request/requestAccount'
import './login.html'

const states = {
  login: 'login',
  loggedIn: 'loggedIn',
  requesting: 'requesting'
}

Template.login.onCreated(function () {
  const instance = this

  instance.init({
    useLanguage: [loginLanguages],
    onComplete () {
      instance.state.set('initComplete', true)
    },
    onError (err) {
      instance.state.set('loginError', err)
    }
  })

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
  login () {
    return Template.getState('view') === states.login
  },
  loggedIn () {
    const instance = Template.instance()
    return instance.state.get('view') === states.loggedIn && !instance.state.get('loggingIn')
  },
  loggingIn () {
    return Template.getState('loggingIn')
  },
  loadComplete () {
    return Template.getState('initComplete')
  },
  view (name) {
    return name && Template.getState('view') === states[name]
  },
  requestAccountData () {
    return {
      complete: function () {
        const instance = this
        instance.state.set('view', states.login)
      }.bind(Template.instance())
    }
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
        console.error(err)

        if (err.name === 'Accounts.LoginCancelledError') {
          err.reason = 'pages.login.cancelled'
        }

        return templateInstance.state.set('loginError', err)
      }

      templateInstance.data.onSuccess(res)
    })
  },
  'click .request-btn': async (event, templateInstance) => {
    event.preventDefault()
    templateInstance.state.set('view', states.requesting)
  }
})
