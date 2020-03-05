import { check } from 'meteor/check'
import { Router } from './Router'
import { loggedIn, loggedOut } from '../../utils/accountUtils'

export const createLoginTrigger = (redirectRoute) => {
  check(redirectRoute.path, Function)
  return function loginTrigger () {
    if (loggedOut()) {
      const location = Router.location()
      const fullPath = redirectRoute.path(encodeURIComponent(location))
      Router.go(fullPath)
    }
  }
}

export const createLoggedinTrigger = (redirectRoute) => {
  check(redirectRoute.path, Function)
  return function loggedTrigger () {
    if (loggedIn()) {
      const location = Router.location()
      const fullPath = redirectRoute.path(encodeURIComponent(location))
      Router.go(fullPath)
    }
  }
}

export const createNotFoundTrigger = (route) => (notFoundContext) => {
  // log not found route
  Router.go(route)
}
