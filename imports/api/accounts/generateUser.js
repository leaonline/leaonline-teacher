import { Meteor } from 'meteor/meteor'
import { OtuLea } from '../../startup/client/remote'

const generateUserMethodName = Meteor.settings.public.hosts.otulea.methods.generateUser
const userExistsMethodName = Meteor.settings.public.hosts.otulea.methods.userExists

export const generateUser = () => OtuLea.call({
  name: generateUserMethodName,
  args: {}
})

export const userExists = ({ code }) => OtuLea.call({
  name: userExistsMethodName,
  args: { code }
})
