import { Routes } from './Routes'
import settings from '../../resources/i18n/routes'

export const resolveRoute = function resolve (key, ...optionalArgs) {
  const route = Routes[key]
  if (!route) {
    return settings.notFound
  }
  return route && route.path(...optionalArgs)
}
