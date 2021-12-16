import { Meteor } from 'meteor/meteor'
import { createRemote } from './Remote'

const { otulea } = Meteor.settings.public.hosts

/**
 * @inheritDoc {Remote}
 * @type {Remote}
 */
export const OtuLea = createRemote(otulea)

OtuLea.generateUser = async () => await OtuLea.call({
  name: otulea.methods.generateUser,
  args: {}
})

OtuLea.userExists = async ({ code }) => await OtuLea.call({
  name: otulea.methods.userExists,
  args: { code }
})

/**
 *
 * @param {Array<String>} users - the list of userIds
 * @param {string} dimension - the dimension id
 * @param {boolean} addSession - if session docs should be fetched, too
 * @return {Promise<Array>|Promise<Object>}
 */
OtuLea.getFeedback = async ({ users, dimension = undefined, addSession = false }) => await OtuLea.call({
  name: otulea.methods.getFeedback,
  args: { users, dimension, addSession }
})
