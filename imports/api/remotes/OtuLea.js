import { Meteor } from 'meteor/meteor'
import { createRemote } from './Remote'

const { otulea } = Meteor.settings.public.hosts

export const OtuLea = createRemote(otulea)

OtuLea.generateUser = async () => await OtuLea.call({
  name: otulea.methods.generateUser,
  args: {}
})

OtuLea.userExists = async ({ code }) => await OtuLea.call({
  name: otulea.methods.userExists,
  args: { code }
})

OtuLea.getFeedback = async ({ users, dimension }) => await OtuLea.call({
  name: otulea.methods.getFeedback,
  args: { users, dimension }
})
