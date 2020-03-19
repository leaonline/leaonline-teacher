import { Routes } from './Routes'
import { i18n } from '../i18n/I18n'

export const resolveRoute = function resolve (key, ...optionalArgs) {
  const route = Routes[key]
  if (!route) {
    return i18n.get('routes.notFound')
  }
  return route && route.path(...optionalArgs)
}
