/**
 * Prints an object's properties as key-value pairs, separated by rn-newlines.
 * @param {object} obj the object to print
 * @return {string}
 */
export const printObj = obj => {
  let out = ''
  Object.entries(obj).forEach(([key, value]) => {
    out += `${key}: ${value}\r\n`
  })
  return out
}
