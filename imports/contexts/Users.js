import { Meteor } from 'meteor/meteor'
import { onServer } from '../utils/arch'

export const Users = {
  name: 'users',
  label: 'users.title',
  icon: 'users'
}

Users.methods = {}

Users.methods.getServiceCredentials = {
  name: 'users.methods.getServiceCredentials',
  schema: {},
  numRequests: 5,
  timeInterval: 500,
  run: onServer(function () {
    const user = Meteor.users.findOne(this.userId)
    return {
      accessToken: user.services.lea.accessToken
    }
  }),
  call: function (cb) {
    Meteor.call(Users.methods.getServiceCredentials.name, cb)
  }
}
