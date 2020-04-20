import { Template } from 'meteor/templating'
import { Router } from '../../api/routing/Router'
import { Routes } from '../../api/routing/Routes'
import { currentRoute, resolveRoute, routeLabel } from '../../api/routing/routeHelpers'

Router.setDefaultLabel('teacher app')
Router.setDefaultTarget('main-render-target')
Router.setLoadingTemplate('loading')

Object.keys(Routes).forEach(key => {
  const route = Routes[key]
  route.name = key
  Router.register(route)
})

Template.registerHelper('route', resolveRoute)
Template.registerHelper('routeLabel', routeLabel)
Template.registerHelper('currentRoute', currentRoute)
