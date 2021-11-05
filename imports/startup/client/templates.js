import { Meteor } from 'meteor/meteor'
import { Blaze } from 'meteor/blaze'
import { addLanguage } from '../../api/i18n/addLanguage'

Blaze.TemplateInstance.prototype.init = function ({ contexts = [], subscribe = [], debug = false, language, onComplete, onError }) {
  import { initClientContext } from '../../infrastructure/contexts/initClientContext'

  const handleError = error => {
    if (onError) {
      onError(error)
    }
    else {
      console.error(error)
    }
  }
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
    contexts.forEach(ctx => initClientContext(ctx))
  }
  catch (error) {
    handleError(error)
  }

  if (language) {
    api.debug('load language')
    allComplete.push(addLanguage(language, api.debug))
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
