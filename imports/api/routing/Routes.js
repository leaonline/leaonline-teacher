import { createNotFoundTrigger } from './triggers'
import { i18n } from '../i18n/I18n'

export const Routes = {}

/**
 * Renders a default template for all pages that have not been found.
 */

Routes.notFound = {
  path: () => {
    const notFound = i18n.get('routes.notFound')
    return `/${notFound}`
  },
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
 */

Routes.fallback = {
  path: () => '*',
  label: 'pages.redirecting.title',
  triggersEnter: () => [
    createNotFoundTrigger(Routes.notFound)
  ],
  async load () {
    return import('../../ui/components/loading/loading')
  },
  target: null,
  template: 'loading',
  roles: null,
  data: null
}
