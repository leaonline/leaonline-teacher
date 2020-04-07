import { Tracker } from 'meteor/tracker'
import SimpleSchema from 'simpl-schema'

SimpleSchema.extendOptions(['autoform', 'name'])

export const Schema = {}

Schema.create = function (schemaDefinition, options) {
  return new SimpleSchema(schemaDefinition, Object.assign({}, options, { tracker: Tracker }))
}
