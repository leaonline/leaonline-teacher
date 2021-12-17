import { createGetMethod } from './createGetMethod'
import { createInsertMethod } from './createInsertMethod'
import { createUpdateMethod } from './createUpdateMethod'
import { createRemoveMethod } from './createRemoveMethod'
import { createAllMethod } from './createAllMethod'

export const createMethodsDecorator = ({ get, all, insert, update, remove }) => context => {
  context.methods = context.method || {}

  if (get) {
    context.methods.get = createGetMethod({ context })
  }

  if (insert) {
    context.methods.insert = createInsertMethod({ context })
  }

  if (all) {
    context.methods.all = createAllMethod({ context })
  }

  if (update) {
    context.methods.update = createUpdateMethod({ context })
  }

  if (remove) {
    context.methods.remove = createRemoveMethod({ context })
  }

  return context
}
