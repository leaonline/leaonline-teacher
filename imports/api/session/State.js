import { ReactiveDict } from 'meteor/reactive-dict'

/**
 * Global representation of current selected class, user, etc.
 */

export const State = {}

const state = new ReactiveDict()

state.set({
  currentParticipant: null,
  currentClass: null
})

/**
 * Set or get the current selected participant
 * @param value optional userId (_id) to set this user as the current
 * @return {*}
 */

State.currentParticipant = (value) => {
  if (typeof value !== 'undefined') {
    state.set({ currentParticipant: value })
  }
  return state.get('currentParticipant')
}

/**
 * Set or get the current class
 * @param value optional classId (_id) to set this class as current
 * @return {*}
 */

State.currentClass = (value) => {
  if (typeof value !== 'undefined') {
    state.set({ currentClass: value })
  }
  return state.get('currentClass')
}
