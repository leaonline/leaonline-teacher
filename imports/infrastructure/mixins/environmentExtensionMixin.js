import { createLog } from '../../api/log/createLog'
import { getDocument } from './getDocument'
import { checkDocument } from './checkDocument'

/**
 * This mixin injects useful generic functions into the method or publication
 * environment (the funciton's this-context).
 *
 * @param options
 * @return {*}
 */
export const environmentExtensionMixin = function (options) {
  const { env } = options
  if (env === null || env === false) return options

  const envOptions = env || {}
  const { devOnly = true } = envOptions

  const info = createLog({ name: options.name, type: 'info', devOnly: devOnly })
  const debug = createLog({ name: options.name, type: 'debug', devOnly: devOnly })
  const runFct = options.run

  options.run = function run (...args) {
    // safe-assign our extensions to the environment document
    Object.assign(this, { info, debug, getDocument, checkDocument })

    info('call', { userId: this.userId })
    return runFct.call(this, ...args)
  }

  return options
}
