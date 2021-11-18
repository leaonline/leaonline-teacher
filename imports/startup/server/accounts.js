/* global ServiceConfiguration */
import { Meteor } from 'meteor/meteor'
import { rateLimitAccounts } from '../../infrastructure/factories/ratelimit/rateLimit'

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
})

Accounts.config({
  forbidClientAccountCreation: true
})

Meteor.publish(null, function () {
  const { userId } = this
  if (!this.userId) return this.ready()

  return Meteor.users.find({ _id: this.userId }, {
    fields: {
      'services.lea.firstName': 1,
      'services.lea.lastName': 1,
      'services.lea.email': 1,
      'services.lea.roles': 1
    }
  })
})