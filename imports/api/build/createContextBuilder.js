


export const createContextBuilder = ({ functions = [] }) => {
  return ctx => {
    console.debug('[contextBuilder]: build', ctx.name)
    functions.forEach(fct => fct(ctx))
    return ctx
  }
}