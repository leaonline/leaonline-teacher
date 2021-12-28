import { Meteor } from 'meteor/meteor'
import { onServer, onServerExec } from '../utils/arch'

export const Users = {
  name: 'users',
  label: 'users.title',
  icon: 'users'
}

Users.methods = {}

/**
 * Sends an email to a pre-configured set of destinations with the form data
 * from the user.
 */
Users.methods.requestAccount = {
  name: 'users.methods.requestAccount',
  schema: onServerExec(function () {
    import { Schema } from '../api/schema/Schema'

    return {
      email: Schema.provider.RegEx.EmailWithTLD,
      firstName: String,
      lastName: String,
      institution: String,
      comment: {
        type: String,
        optional: true
      }
    }
  }),
  numRequests: 1,
  timeInterval: 5000,
  isPublic: true,
  run: onServerExec(function () {
    import { Email } from 'meteor/email'
    import { printObj } from '../utils/printObj'

    const options = Meteor.settings.accounts.request
    const headers = { 'content-transfer-encoding': 'quoted-printable' }

    return function (requestDoc) {
      const body = printObj(requestDoc)

      ;(options.to || []).forEach(destination => {
        Email.send({
          to: destination,
          headers: headers,
          from: options.from,
          subject: options.subject,
          text: body
        })
      })
    }
  })
}

Users.methods.getServiceCredentials = {
  name: 'users.methods.getServiceCredentials',
  schema: {},
  numRequests: 5,
  timeInterval: 500,
  run: onServer(function () {
    const user = Meteor.users.findOne(this.userId)
    return {
      accessToken: user.services.lea.accessToken
    }
  }),
  call: function (cb) {
    Meteor.call(Users.methods.getServiceCredentials.name, cb)
  }
}
