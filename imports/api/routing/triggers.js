import { check } from 'meteor/check'
import { Router } from './Router'
import { loggedIn, loggedOut } from '../utils/accountUtils'

/**
 * Creates a trigger that redirects to a given route if the current user is not logged in.
 * @param redirectRoute The route that is redirected to if the user is not logged in
 * @return {loginTrigger} a function that can be added to the {triggersEnter} list
 */

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

/**
 * Creates a trigger that redirects to a given route if the current user is logged in.
 * @param redirectRoute The route that is redirected to if the user is logged in
 * @return {loginTrigger} a function that can be added to the {triggersEnter} list
 */

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

/**
 * Creates a trigger that redirects to a given route if the current route is not found by given path
 * @param redirectRoute The route that is redirected to if the current route is not found by given path
 * @return {loginTrigger} a function that can be added to the {triggersEnter} list
 */

export const createNotFoundTrigger = (redirectRoute) => () => {
  // log not found route
  Router.go(redirectRoute)
}
