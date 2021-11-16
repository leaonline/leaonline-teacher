import { createGetMethod } from './createGetMethod'
import { createInsertMethod } from './createInsertMethod'
import { createUpdateMethod } from './createUpdateMethod'
import { createRemoveMethod } from './createRemoveMethod'

export const createMethodsDecorator = ({ get, insert, update, remove }) => context => {
  context.methods = context.method || {}

  if (get) {
    context.methods.get = createGetMethod({ context })
  }

  if (insert) {
    context.methods.insert = createInsertMethod({ context })
  }

  if (update) {
    context.methods.update = createUpdateMethod({ context })
  }

  if (remove) {
    context.methods.remove = createRemoveMethod({ context })
  }

  return context
}
