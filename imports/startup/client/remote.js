import { DDP } from 'meteor/ddp-client'
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import { Users } from '../../contexts/Users'

const debug = (...args) => console.debug('[otu.lea]:', ...args)
const { otulea } = Meteor.settings.public.hosts

export const OtuLea = {}

OtuLea.connection = () => connection
OtuLea.connected = () => connection.status().connected

const connection = DDP.connect(otulea.url, {
  onConnected: function (err) {
    if (err) return console.error(err) // TODO what to do?
    loginWithLea()
  }
})

const loginWithLea = () => {
  Tracker.autorun(computation => {
    // skip this computation if there is
    // currently no logged in backend user
    if (!Meteor.user() && !Meteor.userId()) {
      // clear window.localStorage entries from previous
      // login results to avoid follow-up 403 errors
      window.localStorage.removeItem(`${otulea.url}/lea/userId`)
      window.localStorage.removeItem(`${otulea.url}/lea/loginToken`)
      window.localStorage.removeItem(`${otulea.url}/lea/loginTokenExpires`)
      // logout connection if still connected
      if (connection.userId()) {
        connection.call('logout')
      }

      return
    }

    Users.methods.getServiceCredentials.call((err, credentials) => {
      if (err || !credentials) {
        connection._loggingIn = false
        console.error(err)
        debug('no credentials received, skip login')
        return
      }
      debug('init login')
      const options = {
        accessToken: credentials.accessToken,
        debug: true
      }
      DDP.loginWithLea(connection, options, (err, res) => {
        connection._loggingIn = false
        if (err) {
          Meteor.logout()
          return console.error(err)
        }
        else {
          debug('logged in with token', !!res)
          computation.stop()
        }
      })
    })
  })
}
