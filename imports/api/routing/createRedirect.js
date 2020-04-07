import { Router } from './Router'

/**
 * Creates a redirect handler for a given route. Use this to decouple {Routes} from {Router}.
 * @param route the route to redirect
 * @param fixedArgs optional, fixed arbitrary arguments passed to {route.path}
 * @return {Function} optional, dynamic arbitrary arguments passed to {route.path}
 */

export const createRedirect = (route, ...fixedArgs) => {
  return function (...args) {
    const finalArgs = fixedArgs.concat(args)
    const path = route.path.apply(null, finalArgs)
    Router.go(path)
  }
}
