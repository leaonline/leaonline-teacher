export const errorToObject = (error = {}) => {
  const { details } = error
  const copy = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error), 0))
  Object.assign(copy.details, details)
  return copy
}
