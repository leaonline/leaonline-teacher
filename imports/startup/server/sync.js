import { Meteor } from 'meteor/meteor'
import { ContentServer } from '../../api/remotes/ContentServer'

// we run the sync after startup separate from the rest of the startup chain
// to prevent the server from crashing due to any errors that occur here

ContentServer.onConnected(() => {
  ContentServer.log('connected, init sync')

  const { dryRun, ...contexts } = Meteor.settings.hosts.content.sync

  Meteor.defer(async () => {
    const entries = Object.entries(contexts)
    for (const [contextName, doSync] of entries) {
      if (!doSync) { return }
      try {
        await ContentServer.sync({ name: contextName, dryRun })
      }
      catch (e) {
        console.error(e.message, e.details)
      }
    }
  })
})
