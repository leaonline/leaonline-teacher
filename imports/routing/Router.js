/* global Roles */
import { FlowRouter, RouterHelpers } from 'meteor/ostrio:flow-router-extra'
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import { Template } from 'meteor/templating'
import { translate } from '../i18n/reactiveTranslate'

/**
 * Facade to a router to support a common definition for routing in case
 * the underlying router will change or be replaced due to a better version
 * or when development of the router stopped.
 */
export const Router = {}
Router.src = FlowRouter
Router.debug = false

Router.go = function (value, ...optionalArgs) {
  const type = typeof value
  if (type === 'object' && value !== null) {
    return FlowRouter.go(value.path(...optionalArgs))
  } else if (type === 'string') {
    return FlowRouter.go(value)
  } else {
    throw new Error(`Unexpected format: [${typeof type}], expected string or object`)
  }
}

Router.has = function (path) {
  return paths[path]
}

Router.location = function (options = {}) {
  if (options.pathName) {
    return FlowRouter.current().route.name
  }
  return FlowRouter.current().path
}

Router.current = function (options = {}) {
  if (options.reactive) {
    FlowRouter.watchPathChange()
  }
  return FlowRouter.current()
}

Router.param = function (value) {
  const type = typeof value
  if (type === 'object') {
    return FlowRouter.setParams(value)
  }
  if (type === 'string') {
    return FlowRouter.getParam(value)
  }
  throw new Error(`Unexpected format: [${type}], expected string or object`)
}

Router.queryParam = function (value) {
  const type = typeof value
  if (type === 'object') {
    return FlowRouter.setQueryParams(value)
  }
  if (type === 'string') {
    return FlowRouter.getQueryParam(value)
  }
  throw new Error(`Unexpected format: [${type}], expected string or object`)
}

let _titlePrefix = ''

Router.titlePrefix = function (value = '') {
  _titlePrefix = value
}

let _loadingTemplate

Router.loadingTemplate = function (value = 'loading') {
  _loadingTemplate = value
}

const paths = {}

/*
    .whileWaiting() hook
    .waitOn() hook
    .waitOnResources() hook
    .endWaiting() hook
    .data() hook
    .onNoData() hook
    .triggersEnter() hooks
    .action() hook
    .triggersExit() hooks
 */
function createRoute (routeDef, onError) {
  return {
    name: routeDef.key,
    whileWaiting () {
      // we render by default a "loading" template if the Template has not been loaded yet
      // which can be explicitly prevented by switching showLoading to false
      if (!Template[routeDef.template] && routeDef.showLoading !== false) {
        this.render(routeDef.target, _loadingTemplate, { title: routeDef.label })
      }
    },
    waitOn () {
      return Promise.all([
        Promise.resolve(routeDef.load()),
        new Promise((resolve) => {
          Tracker.autorun((computation) => {
            const loadComplete = !Meteor.loggingIn() && Roles.subscription.ready()
            if (loadComplete) {
              computation.stop()
              resolve()
            }
          })
        })
      ])
    },
    triggersEnter: routeDef.triggersEnter && routeDef.triggersEnter(),
    action (params, queryParams) {
      console.log(routeDef)
      // if we have loaded the template but it is not available
      // on the rendering pipeline through Template.<name> we
      // just skip the action and wait for the next rendering cycle
      if (!Template[routeDef.template]) {
        console.warn(`Found rendering attempt on unloaded Template [${routeDef.template}]`)
        return
      }

      // run custom actions to run at very first,
      // for example to scroll the window to the top
      // or prepare the window environment otherwise
      if (routeDef.onAction) {
        routeDef.onAction(params, queryParams)
      }

      const data = routeDef.data || {}
      data.params = params
      data.queryParams = queryParams

      const label = translate(routeDef.label)
      document.title = `${_titlePrefix} ${label}`

      try {
        this.render(routeDef.target, routeDef.template, data)
      } catch (e) {
        console.error(e)
        if (typeof onError === 'function') {
          onError(e)
        }
      }
    }
  }
}

Router.register = function (routeDefinition) {
  const path = routeDefinition.path()
  paths[path] = routeDefinition
  const routeInstance = createRoute(routeDefinition)
  return FlowRouter.route(path, routeInstance)
}

Router.helpers = {
  isActive (name) {
    return RouterHelpers.name(name)
  }
}
