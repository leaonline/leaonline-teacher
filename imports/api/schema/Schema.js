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
