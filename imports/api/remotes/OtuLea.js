import { Meteor } from 'meteor/meteor'
import { createRemote } from './Remote'

const { otulea } = Meteor.settings.public.hosts

/**
 * @inheritDoc {Remote}
 * @type {Remote}
 */
const OtuLea = createRemote(otulea)

OtuLea.generateUser = async () => await OtuLea.call({
  name: otulea.methods.generateUser,
  args: {}
})

OtuLea.userExists = async ({ code }) => await OtuLea.call({
  name: otulea.methods.userExists,
  args: { code }
})

/**
 * Returns the last 5 feedbacks that were generated but only one for each user
 * @param users {Array<String>} user ids
 * @return {Promise<*>}
 */
OtuLea.recentFeedback = async ({ users, resolve }) => await OtuLea.call({
  name: otulea.methods.recentCompleted,
  args: { users, resolve }
})

/**
 * Gets feedback incl. dependencies for given users
 * @param {Array<String>} users - the list of userIds
 * @param {string} dimension - the dimension id
 * @return {Promise<Array>|Promise<Object>}
 */
OtuLea.getRecords = async ({ users, dimension }) => await OtuLea.call({
  name: otulea.methods.getRecords,
  args: { users, dimension }
})

export { OtuLea }
