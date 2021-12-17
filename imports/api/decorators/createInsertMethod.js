import { onServer } from '../../utils/arch'
import { CollectionHooks } from '../collections/CollectionHooks'
import { Meteor } from 'meteor/meteor'

export const createInsertMethod = ({ context, schema, run, ...additional }) => {
  const { name } = context
  const finalSchema = schema || (typeof context.schema === 'function')
    ? context.schema()
    : context.schema

  return {
    name: `${name}.methods.insert`,
    schema: finalSchema,
    run: onServer(run || function (insertDoc) {
      const Collection = context.collection?.()
      if (!Collection) {
        throw new Meteor.Error('get.error', 'errors.collectionUndefined', { name })
      }

      CollectionHooks.beforeInsert(this.userId, insertDoc)

      return Collection.insert(insertDoc)
    }),
    ...additional
  }
}
