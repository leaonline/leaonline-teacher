/* global ServiceConfiguration fetch */
import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { rateLimitAccounts } from '../../infrastructure/factories/ratelimit/rateLimit'
import { getOAuthDDPLoginHandler, defaultDDPLoginName } from 'meteor/leaonline:ddp-login-handler'

rateLimitAccounts()

Meteor.startup(async () => {
  const { oauth } = Meteor.settings
  await ServiceConfiguration.configurations.upsertAsync(
    { service: 'lea' },
    {
      $set: {
        debug: true,
        loginStyle: 'popup',
        clientId: oauth.clientId,
        secret: oauth.secret,
        dialogUrl: oauth.dialogUrl,
        accessTokenUrl: oauth.accessTokenUrl,
        identityUrl: oauth.identityUrl,
        redirectUrl: oauth.redirectUrl,
        extraFields: [
          'firstName',
          'lastName',
          'roles'
        ]
      }
    }
  )

  const loginHandler = getOAuthDDPLoginHandler({
    identityUrl: oauth.identityUrl,
    httpGet: async (url, requestOptions) => {
      const response = await fetch(url, requestOptions)
      const data = await response.json()
      return { data, status: response.status }
    },
    debug: console.debug
  })

  Accounts.registerLoginHandler(defaultDDPLoginName, loginHandler)
})

Accounts.config({
  forbidClientAccountCreation: true,
  defaultFieldSelector: {
    _id: 1,
    firstName: 1,
    lastName: 1,
    roles: 1,
    'services.lea.firstName': 1,
    'services.lea.lastName': 1,
    'services.lea.email': 1,
    'services.lea.roles': 1
  }
})

/* TODO remove when Accounts.config.defaultFieldSelector is fixed */

Meteor.publish(null, function () {
  const { userId } = this
  if (!userId) return this.ready()

  return Meteor.users.find({ _id: this.userId }, {
    fields: {
      'services.lea.firstName': 1,
      'services.lea.lastName': 1,
      'services.lea.email': 1,
      'services.lea.roles': 1
    }
  })
})
