const SimpleSchema = require('simpl-schema')
const schema = def => new SimpleSchema(def)

const optional = type => ({ type, optional: true })

const settingsSchema = schema({
  public: schema({
    app: schema({
      name: String
    }),
    hosts: schema({
      otulea: schema({
        name: String,
        debug: optional(Boolean),
        url: String,
        icon: String,
        methods: schema({
          generateUser: String,
          userExists: String,
          getFeedback: String,
          recentFeedback: String
        })
      }),
      content: schema({
        role: String
      })
    })
  }),

  // PRIVATE

  oauth: schema({
    clientId: String,
    secret: String,
    dialogUrl: String,
    accessTokenUrl: String,
    authorizeUrl: String,
    identityUrl: String,
    redirectUrl: String
  }),
  hosts: schema({
    content: schema({
      name: String,
      debug: optional(Boolean),
      url: String,
      icon: String,
      methods: schema({
        getAll: String
      })
    })
  }),
  accounts: schema({
    request: schema({
      from: String,
      subject: String, // TODO move to i18n
      to: Array,
      'to.$': SimpleSchema.RegEx.Email
    })
  })
})

module.exports = function (settings) {
  settingsSchema.validate(settings)
}
