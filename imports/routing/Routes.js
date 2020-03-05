import settings from '../../resources/i18n/routes'
import { createLoggedinTrigger, createLoginTrigger, createNotFoundTrigger } from './triggers'

export const Routes = {}

/**
 * Renders a default template for all pages that have not been found.
 * @type {{path: (function(): *), label: string, triggersEnter: (function(): *[]), load(), target: null, template:
 *   string, roles: null, data: null}}
 */

Routes.notFound = {
  path: () => `${settings.notFound}`,
  label: 'pages.notFound.title',
  triggersEnter: () => [],
  async load () {
    return import('../../ui/pages/notfound/notFound')
  },
  target: null,
  template: 'notFound',
  roles: null,
  data: {
    next () {
      return Routes.overview
    }
  }
}

/**
 * Reroute to notFound route in case an unknown / non-maching url has been detected.
 * @type {{path: (function(): string), label: *, triggersEnter: (function(): *[]), load(), target: null, template:
 *   string, roles: null, data: null}}
 */

Routes.fallback = {
  path: () => '*',
  label: 'pages.redirecting.title',
  triggersEnter: () => [
    createNotFoundTrigger(Routes.notFound)
  ],
  async load () {
    return import('../../ui/pages/loading/loading')
  },
  target: null,
  template: 'loading',
  roles: null,
  data: null
}

/**
 * The starting page of the app
 */
Routes.welcome = {
  path: () => `${settings.welcome}`,
  label: 'pages.welcome.title',
  triggersEnter: () => [],
  async load () {
    return import('../../ui/pages/welcome/welcome')
  },
  target: null,
  template: 'welcome',
  roles: null,
  data: {
    next () {
      return Routes.overview
    }
  }
}

/**
 * Overview page to select dimension and level
 */
Routes.overview = {
  path: () => `${settings.overview}`,
  label: 'pages.overview.title',
  triggersEnter: () => [
    createLoginTrigger(Routes.welcome)
  ],
  async load () {
    return import('../../ui/pages/overview/overview')
  },
  target: null,
  template: 'overview',
  roles: null,
  onAction () {
    window.scrollTo(0, 0)
  },
  data: {
    next ({ sessionId, taskId }) {
      return Routes.task.path(sessionId, taskId)
    }
  }
}

/**
 * Task process page, where all tasks are dynamically rendered and processed.
 */

Routes.task = {
  path: (sessionId = ':sessionId', taskId = ':taskId') => {
    return `${settings.task}/${sessionId}/${taskId}`
  },
  label: 'pages.task.title',
  triggersEnter: () => [
    createLoginTrigger(Routes.welcome)
  ],
  async load () {
    return import('../../ui/pages/task/task')
  },
  target: null,
  template: 'task',
  roles: null,
  onAction () {
    window.scrollTo(0, 0)
  },
  data: {
    next ({ sessionId, taskId }) {
      return Routes.task.path(sessionId, taskId)
    },
    prev () {
      return Routes.overview
    },
    finish ({ sessionId }) {
      return Routes.complete.path(sessionId)
    }
  }
}

Routes.complete = {
  path: (sessionId = ':sessionId') => {
    return `${settings.complete}/${sessionId}`
  },
  label: 'pages.complete.title',
  triggersEnter: () => [
    createLoginTrigger(Routes.welcome)
  ],
  async load () {
    return import('../../ui/pages/complete/complete')
  },
  target: null,
  template: 'complete',
  roles: null,
  onAction () {
    window.scrollTo(0, 0)
  },
  data: {
    end () {
      return Routes.logout
    },
    next () {
      return Routes.overview
    }
  }
}

Routes.logout = {
  path: () => {
    return `${settings.logout}`
  },
  label: 'pages.logout.title',
  triggersEnter: () => [],
  async load () {
    return import('../../ui/pages/logout/logout')
  },
  target: null,
  template: 'logout',
  roles: null,
  onAction () {
    window.scrollTo(0, 0)
  },
  data: {
    next () {
      return Routes.overview
    }
  }
}

/**
 * The default route to be used when landing on the page without params
 * @type {{path: (function(): string), label: string, triggersEnter: (function(): *[]), load(): Promise<undefined>,
 *   target: null, template: null, roles: null, data: null}}
 */
Routes.root = {
  path: () => '/',
  label: 'pages.redirecting.title',
  triggersEnter: () => [
    createLoginTrigger(Routes.welcome),
    createLoggedinTrigger(Routes.overview)
  ],
  async load () {
    return import('../../ui/pages/loading/loading')
  },
  target: null,
  template: 'loading',
  roles: null,
  data: null
}

Object.keys(Routes).forEach(key => {
  Routes[key].key = key
})
