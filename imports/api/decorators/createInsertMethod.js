import { onServer } from '../../utils/arch'
import { CollectionHooks } from '../collections/CollectionHooks'

export const createInsertMethod = ({ context, schema, run, ...additional }) => {
  const finalSchema = schema || (typeof context.schema === 'function')
    ? context.schema()
    : context.schema

  return {
    name: `${context.name}.methods.insert`,
    schema: finalSchema,
    run: onServer(run || function (insertDoc) {
      CollectionHooks.beforeInsert(this.userId, insertDoc)
      return context.collection().insert(insertDoc)
    }),
    ...additional
  }
}
