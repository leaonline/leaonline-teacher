import { Users } from '../../contexts/Users'
import { createMethods } from '../../infrastructure/factories/method/createMethods'

Users.collection = () => Meteor.users
const allMethods = Object.values(Users.methods)
createMethods(allMethods)
