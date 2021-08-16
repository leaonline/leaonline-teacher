import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import SimpleSchema from 'simpl-schema'

SimpleSchema.extendOptions(['autoform'])

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
