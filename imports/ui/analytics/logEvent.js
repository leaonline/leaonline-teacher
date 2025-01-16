import { Router } from '../../api/routing/Router'

/**
 *         timestamp,
 *         path,
 *         event: event.type,
 *         template: viewName,
 *         label: event.currentTarget.textContent || event.currentTarget.title,
 *         target: event.target.getAttribute('data-aid') ?? event.target.id ?? event.target.class,
 *         current: event.currentTarget.getAttribute('data-aid') ?? event.currentTarget.id ?? event.currentTarget.class,
 *         error: error && errorToObject(error)
 * @param data
 */
export const logEvent = ({  timestamp = new Date(), value, event, template, label, target, current, error }) => {
  const path = Router.current().path
  console.debug({  timestamp, path, event, template, label, target, current, error, value })
}
