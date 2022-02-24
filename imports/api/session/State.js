import { ReactiveDict } from 'meteor/reactive-dict'

/**
 * Global representation of current selected class, user, etc.
 */

export const State = {}

const state = new ReactiveDict()

state.set({
  currentParticipant: null,
  currentClass: null,
  dimension: null
})

/**
 * Set or get the current selected participant
 * @param value optional userId (_id) to set this user as the current
 * @return {*}
 */

State.currentParticipant = (value) => {
  return updateValue('currentParticipant', value)
}

/**
 * Set or get the current class
 * @param value optional classId (_id) to set this class as current
 * @return {*}
 */

State.currentClass = (value) => {
  return updateValue('currentClass', value)
}

State.currentDimension = value => {
  return updateValue('dimension', value)
}

const updateValue = (key, value) => {
  if (typeof value !== 'undefined') {
    return state.set(key, value)
  }
  return state.get(key)
}