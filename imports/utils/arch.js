import { Meteor } from 'meteor/meteor'

export const onServer = x => Meteor.isServer ? x : undefined
export const onServerExec = fct => Meteor.isServer ? fct() : undefined

export const isomorphic = ({ server, client }) => {
  if (Meteor.isServer) return server()
  if (Meteor.isClient) return client()
}