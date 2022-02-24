import { Meteor } from 'meteor/meteor'

export const templateInit = function ({ contexts = [], remotes = null, subscribe = [], debug = false, useLanguage = null, onComplete, onError }) {
  import {
    initClientContext,
    contextHasInitialized
  } from '../../infrastructure/contexts/initClientContext'
  import { Notify } from '../../ui/components/notifications/Notify'
  import { addLanguage } from '../../api/i18n/addLanguage'
  import { connectRemote } from '../../api/remotes/connectRemote'
  import { Router } from '../../api/routing/Router'

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
  const subscriptions = new Set()

  // ---------------------------------------------------------------------------

  const api = {}
  instance.api = api

  // ---------------------------------------------------------------------------

  api.debug = (...args) => {
    if (!Meteor.isDevelopment || !debug) return
    console.debug(`[${instance.view.name}]:`, ...args)
  }

  // ---------------------------------------------------------------------------

  api.queryParam = (value) => Router.queryParam(value)

  // ---------------------------------------------------------------------------

  api.destroy = () => {
    api.debug('destroy')
    subscriptions.forEach(sub => sub.stop())
  }

  // ---------------------------------------------------------------------------

  api.notify = value => {
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

  // ---------------------------------------------------------------------------

  const modalAction = (name, isClass, action) => {
    const prefix = isClass ? '.' : '#'
    instance.$(`${prefix}${name}`).modal(action)
  }
  api.showModal = (name, isClass = false) => modalAction(name, isClass, 'show')
  api.hideModal = (name, isClass = false) => modalAction(name, isClass, 'hide')

  // ---------------------------------------------------------------------------

  api.subscribe = ({ name, args = {}, onReady, onError }) => {
    const finalName = typeof name === 'object' ? name.name : name
    api.debug('subscribe', finalName)

    instance.subscribe(finalName, args, {
      onReady: () => {
        api.debug('ready', finalName)
        if (onReady) onReady()
      },
      onError (err) {
        if (onError) {
          onError(err)
        }
        else {
          handleError(err)
        }
      }
    })
  }

  // ---------------------------------------------------------------------------

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
    const allRemotes = Array.isArray(remotes)
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
