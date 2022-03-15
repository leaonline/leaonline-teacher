import { Template } from 'meteor/templating'
import '../../components/notifications/notifications' // TODO lazy load
import '../nav/bottom/navBottom'
import '../nav/side/navSide'
import '../legal/legal'
import './containers.scss'
import './containers.html'

// TODO set default lang attribute using a default locale from Meteor.settings
// TODO and once i18n is loaded use the current locale reactively

Template['logged-out-render-target'].onRendered(function () {
  document.documentElement.setAttribute('lang', 'de')
})

Template['main-render-target'].onRendered(function () {
  document.documentElement.setAttribute('lang', 'de')
})
