import { normalizeError } from '../../contexts/errors/api/normalizeError'
import { persistError } from '../../contexts/errors/api/persistError'

export const errorMixin = options => {
  const { name } = options
  const isMethod = name.includes('methods')
  const isPublication = name.includes('publications')
  const isEndpoint = name.includes('routes')
  const runFct = options.run

  options.run = function run (...args) {
    const { userId } = this
    try {
      return runFct.call(this, ...args)
    }
    catch (runtimeError) {
      console.error(runtimeError)
      const normalizedError = normalizeError({
        error: runtimeError,
        userId: userId,
        method: isMethod ? name : undefined,
        publication: isPublication ? name : undefined,
        endpoint: isEndpoint ? name : undefined
      })
      persistError(normalizedError)

      // finally throw original runtime error
      throw runtimeError
    }
  }

  return options
}
