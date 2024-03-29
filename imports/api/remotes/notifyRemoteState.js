import { Notify } from '../../ui/components/notifications/Notify'
import { getRemoteMessage } from './getRemoteMessage'

const lastKeys = new Map()

// TODO read from user preference about what they want to be informed

export const notifyRemoteState = (key, state) => {
  const notAvailable = !state.loggedIn && !state.reason && !state.timedOut

  if (state.connecting || notAvailable) {
    console.debug(`[${key}]: connecting', state.status`)
  }

  const hash = simpleHash(JSON.stringify(state))
  if (lastKeys.get(key) === hash) return
  lastKeys.set(key, hash)

  Notify.add({
    type: getColorType(state),
    title: key,
    message: getRemoteMessage(state),
    delay: state.timedOut ? 15000 : 3000
  })
}

const getColorType = ({ loggedIn, timedOut, reason }) => {
  if (loggedIn) return 'success'
  if (timedOut) return 'warning'
  if (reason) return 'danger'
  return 'info'
}

const simpleHash = str => {
  let out = ''

  for (let i = 0; i < str.length - 1; i++) {
    out += str.codePointAt(i).toString(16)
  }

  return out
}
