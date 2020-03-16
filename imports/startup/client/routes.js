import { Router } from '../../api/routing/Router'
import { Routes } from '../../api/routing/Routes'
import '../../ui/components/loading/loading'

Router.setDefaultLabel('teacher app')
Router.setDefaultTarget('main-render-target')
Router.setLoadingTemplate('loading')

Object.values(Routes).forEach(Router.register)

Template.registerHelper('route', function (name, ...args) {
  const route = Routes[name]
  if (!route) return ''
  return route.path.apply(null, args)
})
