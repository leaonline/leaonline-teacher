import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import SimpleSchema from 'simpl-schema'
import { ServiceRegistry } from '../ServiceRegistry'

const schemaOptions = Object.keys(ServiceRegistry.schemaOptions)
SimpleSchema.extendOptions(schemaOptions)

export const Schema = {}

let defaultSchema

Schema.setDefault = schema => {
  defaultSchema = schema
}

Schema.withDefault = (schema, options) => {
  return Schema.create({ ...defaultSchema, ...schema }, options)
}

Schema.create = function (schemaDefinition, options = {}) {
  const fullOptions = { tracker: Meteor.isClient ? Tracker : undefined, ...options }
  return new SimpleSchema(schemaDefinition, fullOptions)
}

Schema.provider = SimpleSchema

const regExpMessages = {
  [SimpleSchema.RegEx.EmailWithTLD]: () => translate('schema.EmailWithTLD')
  // {exp: SimpleSchema.RegEx.Email, msg: () => i18n.t("SchemaMessages.RegExMessages.email")},
  // {exp: SimpleSchema.RegEx.Domain, msg: () => i18n.t("SchemaMessages.RegExMessages.domain")},
  // {exp: SimpleSchema.RegEx.WeakDomain, msg: () => i18n.t("SchemaMessages.RegExMessages.weakDomain")},
  // {exp: SimpleSchema.RegEx.IP, msg: () => i18n.t("SchemaMessages.RegExMessages.ip")},
  // {exp: SimpleSchema.RegEx.IPv4, msg: () => i18n.t("SchemaMessages.RegExMessages.ipv4")},
  // {exp: SimpleSchema.RegEx.IPv6, msg: () => i18n.t("SchemaMessages.RegExMessages.ipv6")},
  // {exp: SimpleSchema.RegEx.Url, msg: () => i18n.t("SchemaMessages.RegExMessages.url")},
  // {exp: SimpleSchema.RegEx.Id, msg: () => i18n.t("SchemaMessages.RegExMessages.id")},
  // {exp: SimpleSchema.RegEx.ZipCode, msg: () => i18n.t("SchemaMessages.RegExMessages.zipCode")},
  // {exp: SimpleSchema.RegEx.Phone, msg: () => i18n.t("SchemaMessages.RegExMessages.phone")},
}

SimpleSchema.setDefaultMessages({
  messages: {
    en: {
      required: current => translate('schema.required', current),
      regEx ({ label, regExp }) {
        let msgFn

        if (regExp) { msgFn = regExpMessages[regExp] }

        const message = msgFn ? msgFn() : 'SchemaMessages.RegExMessages.error'
        return `${label} ${message}`
      }
    }
  }
})

let _translate

const translate = (...args) => {
  if (!_translate) {
    (function () {
      import { i18n } from '../i18n/I18n'
      _translate = i18n
    })()
  }
  return _translate.get(...args)
}
