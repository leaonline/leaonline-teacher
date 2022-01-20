/**
 * Extracts the full name of the current logged-in user.
 * This DOES NOT extract the name of an attendee.
 * @param user
 * @return {string}
 */
export const getUserName = user => user?.services?.lea && [
  user.services.lea.firstName,
  user.services.lea.lastName
].filter(s => !!s).join(' ')
