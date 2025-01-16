import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { errorToObject } from '../utils/errorToObject'
import { logEvent } from './logEvent'

const { analytics } = Meteor.settings.public
export const initAnalytics = () => {
  if (!analytics?.enabled) { return }

  const original = Template.prototype.events
  Template.prototype.events = function (dict) {
    const instance = this
    const map = withAnalytics(dict, instance)
    return original.call(instance, map)
  }

  // other global events
  document.addEventListener("visibilitychange", () => {
    logEvent({
      event: 'visibilitychange',
      template: 'global',
      target: 'window.document',
      value: document.visibilityState
    })
  })
}

const withAnalytics = (events, instance) => {
  const map = {}

  Object.entries(events).forEach(([key, fn]) => {
    const exclude = analytics.skip.some(name => key.includes(name))
    map[key] = exclude
      ? fn
      : wrapFn({ key, fn, instance })
  })

  return map
}

const wrapFn = ({ key, fn, instance }) => {
  const { viewName } = instance

  return async function (event, templateInstance) {
    const timestamp = new Date()

    const env = this
    let error

    try {
      await fn.call(env, event, templateInstance)
    } catch (e) {
      error = e
    } finally {
      logEvent({
        timestamp,
        event: event.type,
        template: viewName,
        label: String(event.currentTarget.textContent ?? event.currentTarget.title ?? '').trim().replace(/\s+/g, ' '),
        target: event.target.getAttribute('data-aid') ?? event.target.id ?? event.target.class,
        current: event.currentTarget.getAttribute('data-aid') ?? event.currentTarget.id ?? event.currentTarget.class,
        error: error && errorToObject(error)
      })
    }
  }
}
