import { Meteor } from 'meteor/meteor'

const types = ['log', 'info', 'warn', 'debug', 'error']

export const createLog = ({ name, type = 'info', devOnly } = {}) => {
  if (!types.includes(type)) {
    throw new Error(`Unexpected log type ${type}`)
  }

  if (devOnly && !Meteor.isDevelopment) {
    return () => {}
  }

  const target = console[type]
  const infoName = `[${name}]:`
  return (...args) => {
    args.unshift(infoName)
    target.apply(console, args)
    return true
  }
}
