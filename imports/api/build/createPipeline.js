/**
 * Takes a queue of (build-) functions and returns a function that applies
 * all these functions to a given context.
 * @param {Array<Function>} functions the list of functions to apply
 * @param {function} debug optional debug parameter
 * @return {function(*=): *}
 */
export const createPipeline = ({ functions = [], debug = () => {} }) => {
  return ctx => {
    debug('build', ctx.name)
    functions.forEach(fct => fct(ctx))
    return ctx
  }
}
