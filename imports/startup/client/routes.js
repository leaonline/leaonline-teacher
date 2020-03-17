import { Template } from 'meteor/templating'
import { Router } from '../../api/routing/Router'
import { Routes } from '../../api/routing/Routes'
import { resolveRoute } from '../../api/routing/routeHelpers'

Router.setDefaultLabel('teacher app')
Router.setDefaultTarget('main-render-target')
Router.setLoadingTemplate('loading')

Object.values(Routes).forEach(Router.register)

Template.registerHelper('route', resolveRoute)
