/**
 * Extracts the name of a given test attendee and optionally her code.
 *
 * @param user {object} the user object of the attendee
 * @param alwaysIncludeCode {boolean} if true, the code will be added
 * @return {string|undefined} a full name and/or code representation
 */
export const getAttendeeName = (user, { alwaysIncludeCode = false } = {}) => {
  if (!user) { return }

  const code = user.account?.code

  // fallback: if both names are undefined, we simply return the single code
  if (!user.firstName && !user.lastName) {
    return code
  }

  // we need to support that both values are optional
  let name = [user.firstName, user.lastName].filter(byDefined).join(' ')

  if (alwaysIncludeCode && code) {
    name += ` - ${code}`
  }

  return name.trim()
}

const byDefined = x => !!x