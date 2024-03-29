/* global ServiceConfiguration */
import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { HTTP } from 'meteor/jkuester:http'
import { rateLimitAccounts } from '../../infrastructure/factories/ratelimit/rateLimit'
import { getOAuthDDPLoginHandler, defaultDDPLoginName } from 'meteor/leaonline:ddp-login-handler'

rateLimitAccounts()

Meteor.startup(() => {
  const { oauth } = Meteor.settings
  ServiceConfiguration.configurations.upsert(
    { service: 'lea' },
    {
      $set: {
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
    httpGet: (url, requestOptions) => HTTP.get(url, requestOptions),
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
