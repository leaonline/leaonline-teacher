import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { createCollectionFactory } from 'meteor/leaonline:collection-factory'
import { Schema } from '../../../api/schema/Schema'

const collectionFactory = createCollectionFactory({
  schemaFactory: (schema) => {
    return Schema.withDefault(schema, {
      clean: {
        autoConvert: false,
        filter: false,
        getAutoValues: true,
        removeEmptyStrings: false,
        removeNullsFromArrays: false,
        trimStrings: false
      },
      humanizeAutoLabels: false,
      requiredByDefault: true
    })
  }
})

export const createCollection = (context) => {
  if (context.collection) throw new Error(`Collection already exists for [${context.name}]`)

  const schema = typeof context.schema === 'function'
    ? context.schema()
    : context.schema

  if (context.isLocalCollection) {
    const local = new Mongo.Collection(null)
    //const override = { collection: local, schema }
    //return collectionFactory({ ...context, ...override })
    return local
  }

  return collectionFactory({ ...context, schema })
}
