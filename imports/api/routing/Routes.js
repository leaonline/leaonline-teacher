import { createLoggedinTrigger, createLoginTrigger, createNotFoundTrigger } from './triggers'
import { translateRoute } from './translateRoute'
import { createRedirect } from './createRedirect'
import { reactiveTranslate } from '../i18n/reactiveTranslate'
import { arrayToQueryParams } from '../../ui/utils/arrayToQueryParams'

/**
 * Routes are static definitions of pages that the {Router} uses to navigate.
 *
 * A route defines the following properties:
 *
 * {path}
 * Unique (relative) url that separates this route from other route.
 * Must be a function, that resolves to a valid (relative) url string.
 *
 *
 * {label}
 * The translation id for the human readable name of this route.
 * Must be a string.
 *
 * {triggersEnter}
 * A list of functions that run on the router's on-enter trigger.
 * Can be undefined or a function that resolves to an array of functions.
 *
 * {load}
 * An async function that loads the corresponding template of the given route.
 * Must be an async function.
 *
 * {template}
 * The name of the template as defined in the Template file.
 * Must be a string and exactly match the Template's name.
 *
 * {target}
 * Optional. Defines a render target in case a route is defined for a specific area to be drawn
 * by the rendering engine.
 *
 * {data}
 * Optional. An object with arbitrary properties that can be passed to the Template and
 * will occur in the Template's {instance.data}. Use this to define routing callbacks
 * to keep the {Routes} definitions out of the Template files.
 *
 *
 * @class Singleton class-like structure
 */

export const Routes = {}

// triggers for triggersEnter
// use lazy initialization within
// the triggersEnter methods

let rootLoginTrigger
let myClassesTrigger
let notFoundTrigger

// redirects for data callbacks
// use lazy initialization within
// the data callback methods

let toMyClasses

/**
 * This route is triggered when the user enters the url without any further suffix.
 * Based on the current logged-in state (logged-in, logged-out) the respective trigger
 * will invoke a redirect to either the login page or the dashboard page.
 *
 * Example: http://localhost:3000
 * Example: https://mysite.com
 */

Routes.root = {
  path: () => '/',
  label: reactiveTranslate('routes.redirecting'),
  triggersEnter: () => {
    if (!rootLoginTrigger) {
      rootLoginTrigger = createLoginTrigger(Routes.login)
    }
    if (!myClassesTrigger) {
      myClassesTrigger = createLoggedinTrigger(Routes.myClasses)
    }
    return [rootLoginTrigger, myClassesTrigger]
  },
  async load () {
    return import('../../ui/components/loading/loading')
  },
  target: null,
  template: 'loading',
  data: null
}

/**
 * Renders a default template for all pages that have not been found.
 */

Routes.notFound = {
  path: () => {
    const notFound = translateRoute(Routes.notFound)
    return `/${notFound}`
  },
  label: reactiveTranslate('pages.notFound.title'),
  triggersEnter: () => [],
  async load () {
    return import('../../ui/pages/notfound/notFound')
  },
  target: 'logged-out-render-target',
  template: 'notFound',
  data: {
    next () {
      return Routes.overview
    }
  }
}

/**
 * Reroute to notFound route in case an unknown / non-maching url has been detected.
 */

Routes.fallback = {
  path: () => '*',
  label: reactiveTranslate('routes.redirecting'),
  triggersEnter: () => {
    if (!notFoundTrigger) notFoundTrigger = createNotFoundTrigger(Routes.notFound)
    return [notFoundTrigger]
  },
  async load () {
    return import('../../ui/components/loading/loading')
  },
  target: null,
  template: 'loading',
  data: null
}

/**
 * The login page for authentication.
 */

Routes.login = {
  path: () => {
    const path = translateRoute(Routes.login)
    return `/${path}`
  },
  label: reactiveTranslate('pages.login.title'),
  triggersEnter: () => {
    if (!myClassesTrigger) myClassesTrigger = createLoggedinTrigger(Routes.myClasses)
    return [myClassesTrigger]
  },
  async load () {
    return import('../../ui/pages/login/login')
  },
  target: 'logged-out-render-target',
  template: 'login',
  data: {
    onSuccess: () => {
      if (!toMyClasses) {
        toMyClasses = createRedirect(Routes.myClasses)
      }
      toMyClasses()
    }
  }
}

/**
 * The logout page for explicit unloading of data und unregistering publications.
 */

Routes.logout = {
  path: () => {
    const path = translateRoute(Routes.logout)
    return `/${path}`
  },
  label: reactiveTranslate('pages.logout.title'),
  triggersEnter: () => [],
  async load () {
    return import('../../ui/pages/logout/logout')
  },
  target: 'logged-out-render-target',
  template: 'logout',
  data: {
    onSuccess: () => createRedirect(Routes.login).call()
  }
}

/**
 * The main overview page where all classes are listed.
 */

Routes.myClasses = {
  path: () => {
    const path = translateRoute(Routes.myClasses)
    return `/${path}`
  },
  label: reactiveTranslate('pages.myClasses.title'),
  triggersEnter: () => {
    if (!rootLoginTrigger) rootLoginTrigger = createLoginTrigger(Routes.login)
    return [rootLoginTrigger]
  },
  async load () {
    return import('../../ui/pages/myclasses/myClasses')
  },
  target: null,
  template: 'myClasses',
  data: {
    getEntryRoute () {
      return Routes.class
    },
    getUserRoute () {
      return Routes.user
    }
  }
}

/**
 * Summary page for a single class.
 */

Routes.class = {
  path: (classId = ':classId') => {
    const path = translateRoute(Routes.class)
    return `/${path}/${classId}`
  },
  label: reactiveTranslate('pages.class.title'),
  triggersEnter: () => {
    if (!rootLoginTrigger) rootLoginTrigger = createLoginTrigger(Routes.login)
    return [rootLoginTrigger]
  },
  async load () {
    return import('../../ui/pages/class/class')
  },
  parent: Routes.myClasses,
  target: null,
  template: 'class',
  data: null
}

/**
 * Summary page for a single user
 */

Routes.user = {
  path: (userId = ':userId', ...queryParams) => {
    const userPath = translateRoute(Routes.user)

    if (!queryParams.length) {
      return `/${userPath}/${userId}`
    }

    const queryParamsStr = arrayToQueryParams(queryParams)
    return `/${userPath}/${userId}?${queryParamsStr}`
  },
  label: reactiveTranslate('pages.user.title'),
  triggersEnter: () => {
    if (!rootLoginTrigger) rootLoginTrigger = createLoginTrigger(Routes.login)
    return [rootLoginTrigger]
  },
  async load () {
    return import('../../ui/pages/user/user')
  },
  parent: Routes.class,
  target: null,
  template: 'user',
  data: null
}
