import { i18n } from '../i18n/I18n'

/**
 * Extracts message-relevant data from remote state and returns an appropriate
 * message.
 *
 * @param {boolean} loggedIn
 * @param {boolean} timedOut
 * @param {string?} reason
 * @return {string}
 */
export const getRemoteMessage = ({ loggedIn, timedOut, reason }) => {
  if (reason) {
    return i18n.isTranslationString(reason)
      ? i18n.get(reason)
      : reason
  }

  if (timedOut) {
    return i18n.get('remote.timedOut')
  }

  if (loggedIn) {
    return i18n.get('remote.loggedIn')
  }

  return ''
}