import { Blaze } from 'meteor/blaze'

Blaze.TemplateInstance.prototype.init = function ({ contexts = [], subscribe = [], onComplete, onError }) {
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
    if (!Meteor.isDevelopment) return
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
  } catch (error) {
    handleError(error)
  }

  if (allComplete.length === 0) {
    onComplete(api)
  } else {
    instance.autorun(c => {
      if (allComplete.every(rv => rv.get())) {
        c.stop()
        api.info('call dependencies onComplete')
        onComplete(api)
      }
    })
  }

  return api
}
