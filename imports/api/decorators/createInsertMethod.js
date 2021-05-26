import { onServer } from '../../utils/arch'
import { CollectionHooks } from '../collections/CollectionHooks'

export const createInsertMethod = ({ context, schema, run, ...additional }) => {
  const finalSchema = schema || (typeof context.schema === 'function')
    ? context.schema()
    : context.schema

  const defaultRun = onServer(function (insertDoc) {
    CollectionHooks.beforeInsert(this.userId, insertDoc)
    return context.collection().insert(insertDoc)
  })

  return {
    name: `${context.name}.methods.insert`,
    schema: finalSchema,
    run: onServer(run || defaultRun),
    ...additional
  }
}