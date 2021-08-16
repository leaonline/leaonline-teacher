import { Meteor } from 'meteor/meteor'

export const onServer = x => Meteor.isServer && x
export const onServerExec = fct => Meteor.isServer && fct()
