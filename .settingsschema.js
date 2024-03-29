const SimpleSchema = require('simpl-schema')
const schema = def => new SimpleSchema(def)

const optional = type => ({ type, optional: true })

const settingsSchema = schema({
  public: schema({
    issueMail: String,
    debug: {
      type: Array,
      optional: true
    },
    'debug.$': String,
    app: schema({
      name: String,
      label: String,
      description: String,
      icon: String,
      logLevel: String
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
          getRecords: String,
          recentCompleted: String
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
      }),
      jwt: schema({
        key: String,
        sub: String
      }),
      sync: schema({
        dryRun: Boolean,
        dimension: Boolean,
        alphaLevel: Boolean,
        competency: Boolean,
        competencyCategory: Boolean
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
