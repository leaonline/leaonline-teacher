import { Meteor } from 'meteor/meteor'
import { ReactiveVar } from 'meteor/reactive-var'
import { Tracker } from 'meteor/tracker'
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

  let loginCount = 0

  Tracker.autorun(async (computation) => {
    if (!Meteor.userId()) { return } // otherwise login will fail
    const state = remote.state()

    if (loginCount >= 3) {
      connected.set(false)
      notifyRemoteState(remote.name, {
        reason: 'error.maxLoginAttemptsExceeded',
        timedOut: true
      })
      return computation.stop()
    }

    // TODO implement 3 re-login attempts before disconnecting and raising error

    if (state.connected) {
      if (!state.loggingIn && !state.loggedIn) {
        await remote.login(Meteor.user())
        loginCount++
      }

      if (state.loggedIn) {
        computation.stop()
        notifyRemoteState(remote.name, state)
        connected.set(true)
      }
    }

    if (state.status === 'waiting') {
      notifyRemoteState(remote.name, state)
    }

    if (state.timedOut) {
      notifyRemoteState(remote.name, state)
      computation.stop()
    }
  })

  return connected
}
