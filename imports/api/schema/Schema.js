import { Tracker } from 'meteor/tracker'
import SimpleSchema from 'simpl-schema'

SimpleSchema.extendOptions.push('autoform')

export const Schema = {}

Schema.create = function (schemaDefinition, options) {
  const fullOptions = Object.assign({}, options, { tracker: Tracker })
  return new SimpleSchema(schemaDefinition, fullOptions)
}

Schema.provider = SimpleSchema
