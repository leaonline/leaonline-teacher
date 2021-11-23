import { Notify } from '../../ui/components/notifications/Notify'

const lastKeys = new Map()

// TODO read from user preference about what they want to be informed

export const notifyRemoteState = (key, state) => {
  if (state.connecting || !state.loggedIn && !state.reason && !state.timedOut) {
    return
  }

  const hash = simpleHash(JSON.stringify(state))
  if (lastKeys.get(key) === hash) return
  lastKeys.set(key, hash)

  Notify.add({
    type: getColorType(state),
    title: key,
    message: getRemoteMessage(state)
  })

}

const getColorType = ({ loggedIn, timedOut, reason }) => {
  if (loggedIn) return 'success'
  if (timedOut) return 'warning'
  if (reason) return 'danger'
  return 'info'
}

const getRemoteMessage = ({ loggedIn, timedOut, reason }) => {
  if (reason) return reason
  if (timedOut) return 'remote.timedOut'
  if (loggedIn) return 'remote.loggedIn'
  return ''
}
const simpleHash = str => {
  let out = ''

  for (let i = 0; i < str.length - 1; i++) {
    out += str.codePointAt(i).toString(16)
  }

  return out
}
