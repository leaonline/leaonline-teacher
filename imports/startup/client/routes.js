import { Template } from 'meteor/templating'
import { Router } from '../../api/routing/Router'
import { Routes } from '../../api/routing/Routes'
import { i18n } from '../../api/i18n/I18n'
import { resolveRoute, routeLabel } from '../../api/routing/routeHelpers'

Router.setDefaultLabel('teacher app')
Router.setI18n(i18n)
Router.setDefaultTarget('main-render-target')
Router.setLoadingTemplate('loading')

Object.values(Routes).forEach(Router.register)

Template.registerHelper('route', resolveRoute)
Template.registerHelper('routeLabel', routeLabel)
