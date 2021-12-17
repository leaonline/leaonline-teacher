/**
 * Converts a date to locale formatted date-string.
 *
 * @param {Date} date the date to transform
 * @param {string} type optional, allowed: 'time', 'date', 'both'
 * @return {String} formatted date
 */
export const toLocaleDate = (date, type = 'both') => {
  if (!(date instanceof Date)) { return date }

  // TODO load user locale string

  switch (type) {
    case 'time':
      return date.toLocaleTimeString()
    case 'date':
      return date.toLocaleDateString()
    case 'both':
    default:
      return date.toLocaleString()
  }
}
