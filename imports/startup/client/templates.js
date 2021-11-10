import { Meteor } from 'meteor/meteor'
import { Blaze } from 'meteor/blaze'
import { addLanguage } from '../../api/i18n/addLanguage'

Blaze.TemplateInstance.prototype.init = function ({ contexts = [], subscribe = [], debug = false, useLanguage = null, onComplete, onError }) {
  import {
    initClientContext,
    contextHasInitialized
  } from '../../infrastructure/contexts/initClientContext'

  const handleError = error => {
    if (onError) {
      onError(error)
    }
    else {
      console.error(error)
    }
  }

  const languages = []
  const instance = this
  const allComplete = []
  const api = {}

  instance.api = api

  api.debug = (...args) => {
    if (!Meteor.isDevelopment || !debug) return
    console.debug(`[${instance.view.name}]:`, ...args)
  }

  api.subscribe = ({ name, args = {}, onReady }) => {
    const finalName = typeof name === 'object' ? name.name : name
    api.debug('subscribe', finalName)

    return instance.subscribe(finalName, args, {
      onReady: () => {
        api.debug('ready', finalName)
        if (onReady) onReady()
      },
      onError (err) {
        handleError(err)
      }
    })
  }

  // if any context is added we initialize it immediately sync-style
  try {
    contexts.forEach(ctx => {
      if (!contextHasInitialized(ctx)) {
        initClientContext(ctx)

        if (ctx.language) {
          languages.push(ctx.language)
        }
      }
    })
  }
  catch (error) {
    handleError(error)
  }

  if (useLanguage) {
    if (Array.isArray(useLanguage)) {
      languages.push(...useLanguage)
    }
    else {
      languages.push(useLanguage)
    }
  }

  if (languages.length > 0) {
    api.debug(`load ${languages.length} languages`)
    languages.forEach(language => allComplete.push(addLanguage(language, api.debug)))
  }

  if (allComplete.length === 0) {
    api.debug('skip deps; template init complete')
    onComplete(api)
  }

  else {
    instance.autorun(c => {
      if (allComplete.every(rv => rv.get())) {
        c.stop()
        api.debug('template init complete')
        onComplete(api)
      }
    })
  }

  return api
}
