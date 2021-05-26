import { createCollection } from '../factories/collection/createCollection'

const created = new Set()

export const initClientContext = context => {
  if (created.has(context.name)) {
    return context
  }

  if (typeof context.collection !== 'function') {
    const collection = createCollection(context)
    context.collection = () => collection
  }
  
  created.add(context.name)

  return context
}
