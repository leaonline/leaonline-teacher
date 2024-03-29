import { createCollection } from '../factories/collection/createCollection'

const created = new Set()

export const contextHasInitialized = context => created.has(context.name)

export const initClientContext = context => {
  if (created.has(context.name)) {
    return context
  }

  if (typeof context.collection !== 'function') {
    const collection = createCollection(context)
    context.collection = () => collection

    const local = createCollection({
      name: context.name,
      schema: context.schema,
      isLocalCollection: true
    })

    context.localCollection = () => local
  }

  created.add(context.name)

  return context
}
