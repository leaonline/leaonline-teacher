import { Routes } from './Routes'
import { i18n } from '../i18n/I18n'
import { Router } from './Router'

export const resolveRoute = function resolve (key, ...optionalArgs) {
  optionalArgs.pop()

  const route = typeof key === 'object' ? key : Routes[key]
  if (!route) {
    return i18n.get('routes.notFound')
  }
  return route && route.path(...optionalArgs)
}

export const routeLabel = function () {
  const cachedRoute = Router.cache()
  return cachedRoute && cachedRoute.label()
}

export const currentRoute = function (key) {
  const cachedRoute = Router.cache()
  return cachedRoute && cachedRoute.name === key
}
