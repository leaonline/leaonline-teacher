/* global Roles Promise */
import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Tracker } from 'meteor/tracker'
import { ReactiveVar } from 'meteor/reactive-var'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

/**
 * Facade to a router to support a common definition for routing in case
 * the underlying router will change or be replaced due to a better version
 * or when development of the router stopped.
 */
export const Router = {}
Router.src = FlowRouter

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

const routeCache = new ReactiveVar()

Router.cache = function (value) {
  if (value) {
    routeCache.set(value)
  }
  return routeCache.get()
}

Router.has = function (path) {
  return paths[path]
}

Router.location = function ({ pathName } = {}) {
  if (pathName) {
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
  if (typeof value === 'object') {
    return FlowRouter.setParams(value)
  }
  if (typeof value === 'string') {
    return FlowRouter.getParam(value)
  }
  throw new Error(`Unexpected format: [${typeof value}], expected string or object`)
}

Router.queryParam = function (value) {
  if (typeof value === 'object') {
    return FlowRouter.setQueryParams(value)
  }
  if (typeof value === 'string') {
    return FlowRouter.getQueryParam(value)
  }
  throw new Error(`Unexpected format: [${typeof type}], expected string or object`)
}

let _defaultTarget = 'body'

Router.setDefaultTarget = function (value) {
  _defaultTarget = value
}

let _defaultLabel = ''

Router.setDefaultLabel = function (value) {
  _defaultLabel = value
}

let _loadingTemplate

Router.setLoadingTemplate = function (value) {
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
  const label = typeof routeDef.label === 'function'
    ? routeDef.label()
    : routeDef.label
  return {
    name: routeDef.key,
    whileWaiting () {
      // we render by default a "loading" template if the Template has not been loaded yet
      // which can be explicitly prevented by switching showLoading to false
      if (!Template[routeDef.template] && routeDef.showLoading !== false) {
        this.render(routeDef.target || _defaultTarget, _loadingTemplate, { title: label })
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
      // if we have loaded the template but it is not available
      // on the rendering pipeline through Template.<name> we
      // just skip the action and wait for the next rendering cycle
      if (!Template[routeDef.template]) {
        console.warn('[Router]: skipping yet undefined template', routeDef.template)
        document.title = `${_defaultLabel} ${label}`
        return setTimeout(() => {
          Router.refresh(routeDef.target || _defaultTarget, _loadingTemplate)
        }, 50)
      }

      if (routeDef.onAction) {
        routeDef.onAction(params, queryParams)
      }

      window.scrollTo(0, 0)
      const data = routeDef.data || {}
      data.params = params
      data.queryParams = queryParams

      document.title = `${_defaultLabel} ${label}`
      _currentLabel.set(label)
      routeCache.set(routeDef)
      try {
        this.render(routeDef.target || _defaultTarget, routeDef.template, data)
      } catch (e) {
        console.error(e)
        if (typeof onError === 'function') {
          onError(e)
        }
      }
    }
  }
}

const _currentLabel = new ReactiveVar()

Router.label = function () {
  return _currentLabel.get()
}

Router.register = function (routeDefinition) {
  const path = routeDefinition.path()
  paths[path] = routeDefinition
  const routeInstance = createRoute(routeDefinition)
  return FlowRouter.route(path, routeInstance)
}

Router.reload = function () {
  return FlowRouter.reload()
}

Router.refresh = function (target, template) {
  return FlowRouter.refresh(target, template)
}
