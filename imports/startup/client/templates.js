import { Meteor } from 'meteor/meteor'
import { Blaze } from 'meteor/blaze'

Blaze.TemplateInstance.prototype.init = function ({ contexts = [], remotes= null, subscribe = [], debug = false, useLanguage = null, onComplete, onError }) {
  import {
    initClientContext,
    contextHasInitialized
  } from '../../infrastructure/contexts/initClientContext'
  import { Notify } from '../../ui/components/notifications/Notify'
  import { reactiveTranslate } from '../../api/i18n/reactiveTranslate'
  import { addLanguage } from '../../api/i18n/addLanguage'

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
  instance.api.notify = value => {
    if (value instanceof Error) {
      console.error(value)
      return Notify.add({
        type: 'danger',
        title: value.name,
        message: value.message,
        icon: 'exclamation-triangle'
      })
    }

    if (value === true) {
      return Notify.add({
        type: 'success',
        title: 'actions.success',
        icon: 'check'
      })
    }

    Notify.add(value)
  }

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

  if (remotes) {
    let allRemotes = Array.isArray(remotes)
      ? remotes
      : [remotes]

    allRemotes.forEach(remote => {
      allComplete.push(connectRemote(remote))
    })
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

const connectRemote = remote => {
  const connected = new ReactiveVar(false)
  remote.connect()

  Tracker.autorun(async (computation) => {
    if (remote.isConnected()) {
      computation.stop()

      await remote.login(Meteor.user())
      connected.set(true)
    }
  })
  return connected
}
