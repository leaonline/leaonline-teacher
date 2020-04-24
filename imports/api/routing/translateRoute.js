import { i18n } from '../i18n/I18n'

/**
 * Builds an i18n id from a given route by it's name property.
 * @example
 * const label = translateRoute(Routes.login)
 * // where Routes.login.template is 'login'
 * // the i18n key will be 'routes.login' and
 * // the translated word will be 'login'
 *
 * @param route
 * @return {*}
 */
export const translateRoute = route => {
  if (!route || !route.template) {
    console.debug('[translateRoute]: error info', route)
    throw new Error('Expected route name, got undefined.')
  }

  const translatedPath = i18n.get(`routes.${route.template}`)
  if (!translatedPath || translatedPath.includes('.')) {
    console.warn(`Expected route path to be undefined and without '.' but got ${translatedPath}`)
  }

  return translatedPath
}
