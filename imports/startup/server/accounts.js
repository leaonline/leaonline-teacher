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
        redirectUrl: oauth.redirectUrl
      }
    }
  )
})
