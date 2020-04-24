import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import './navTop.html'

const applicationName = Meteor.settings.public.app.name

Template.navTop.helpers({
  applicationName () {
    return applicationName
  }
})
