import { Meteor } from 'meteor/meteor'
import { ContentServer } from '../../api/remotes/ContentServer'
import { ContentDefinitions } from '../../contexts/content/ContentDefinitions'
import { contentBuilder } from '../../api/build/contentBuilder'

const allContent = ContentDefinitions.all()
allContent.forEach(ctx => contentBuilder(ctx))

// we run the sync after startup separate from the rest of the startup chain
// to prevent the server from crashing due to any errors that occur here

ContentServer.onConnected(() => {
  ContentServer.log('connected, init sync')

  const { dryRun, debug, ...contexts } = Meteor.settings.hosts.content.sync

  Meteor.defer(async () => {
    const entries = Object.entries(contexts)

    for (const [name, doSync] of entries) {
      if (!doSync) { return }

      try {
        await ContentServer.sync({ name, debug, dryRun })
      }
      catch (e) {
        console.error(e.message, e.details)
      }
    }

    ContentServer.log('sync complete, disconnect')
    ContentServer.disconnect()
  })
})

// finally attempt to connect
ContentServer.connect()
