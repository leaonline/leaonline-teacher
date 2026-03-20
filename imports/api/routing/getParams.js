import { Router } from './Router'

/**
 * Get the current route params as an object. If there is no current route, returns an empty object.
 * Reactive.
 * @return {{}}
 */
export const getParams = () => {
  const currentRoute = Router.current({ reactive: true })
  return currentRoute ? currentRoute.params : {}
}
