import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { logAnalytics } from './logAnalytics'

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
  document.addEventListener('visibilitychange', () => {
    logAnalytics({
      event: 'visibilitychange',
      template: 'global',
      target: 'window.document',
      value: document.visibilityState
    })
  })
}

const withAnalytics = (events, instance) => {
  const map = {}
  const allSkip = ['Template.autoForm', 'Template.notification', 'Template.afContenteditable', 'div[contenteditable=true]'].concat(analytics.skip)
  Object.entries(events).forEach(([key, fn]) => {
    const [type] = key.split(/\s+/gi)
    const exclude = allSkip.some(name => !analytics.enabled || type.includes(name))
    map[key] = exclude
      ? fn
      : wrapFn({ key, fn, instance })
  })

  return map
}

const wrapFn = ({ fn, instance }) => {
  const { viewName } = instance
  return async function (event, templateInstance) {
    const timestamp = new Date()

    const env = this
    let error

    let value

    if (['change', 'input'].includes(event.type)) {
      if ('checked' in event.currentTarget) {
        value = templateInstance.$(event.currentTarget ?? event.target).is(':checked') ? 'checked' : 'unchecked'
      }
      else {
        value = templateInstance.$(event.currentTarget ?? event.target).val()
      }
    }

    let returnValue

    try {
      returnValue = await fn.call(env, event, templateInstance)
    }
    catch (e) {
      error = e
    }
    finally {
      const target = event.target ?? event.currentTarget ?? {}
      const title = target && typeof target.title === 'string' ? target.title : undefined
      const label = String(
        (target.labels?.length > 0
          ? target.labels[0]
          : target).textContent ?? title).trim().replace(/\s+/g, ' ')
      logAnalytics({
        timestamp,
        title,
        event: event.type,
        template: viewName,
        label,
        target: event.target.getAttribute('data-aid') ?? event.target.id ?? event.target.class,
        current: event.currentTarget.getAttribute('data-aid') ?? event.currentTarget.id ?? event.currentTarget.class,
        error,
        value
      })
    }

    return returnValue
  }
}
