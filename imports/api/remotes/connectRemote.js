import { Meteor } from "meteor/meteor"
import { notifyRemoteState } from './notifyRemoteState'

export const connectRemote = remote => {
  const connected = new ReactiveVar(false)
  const existingState = remote.state()

  // skip already connected remotes
  if (existingState.connected && existingState.loggedIn) {
    connected.set(true)
    return connected
  }

  if (!existingState.connected) {
    remote.connect()
  }

  Tracker.autorun(async (computation) => {
    const state = remote.state()

    // TODO implement 3 re-login attemps before disconnecting and raising error

    if (state.connected) {
      if (!state.loggingIn && !state.loggedIn) {
        await remote.login(Meteor.user())
      }

      if (state.loggedIn) {
        computation.stop()
        notifyRemoteState(remote.name, state)
        connected.set(true)
      }
    }

    if (state.timedOut) {
      notifyRemoteState(remote.name, state)
    }
  })

  return connected
}
