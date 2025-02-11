import { Router } from '../../api/routing/Router'
import { callMethod } from '../../infrastructure/methods/callMethod'
import { Analytics } from '../../contexts/analytics/Analytics'
import { errorToObject } from '../utils/errorToObject'

/**
 * Globally available handler to send analytics data to the server.
 *
 * @param timestamp {Date=}
 * @param value {object=}
 * @param event {object|string|undefined}
 * @param  template {string=}
 * @param  label {string=}
 * @param  aid {string=}
 * @param  title {string=}
 * @param  target {string=}
 * @param  current {string=}
 * @param  error {Error=}
 * @param data
 */
export const logAnalytics = ({ timestamp = new Date(), value, event, aid, title, template, label, target, current, error }) => {
  const path = Router.current().path
  const eventName = typeof event === 'object'
    ? event.type
    : event
  const valueObj = typeof value === 'object'
    ? value
    : { value }
  let errorValue
  if (error instanceof Error) {
    errorValue = errorToObject(error)
    delete errorValue.stack
  }
  else if (typeof error === 'object') {
    errorValue = error
  }
  const labelValue = typeof label === 'string'
    ? label.trim().substring(0, 15)
    : label
  const data = {
    timestamp,
    path,
    event: eventName,
    template,
    label: labelValue,
    target,
    current,
    aid,
    title,
    value: valueObj,
    error: errorValue
  }
  callMethod({
    name: Analytics.methods.send,
    args: data,
    failure: console.error
  })
}
