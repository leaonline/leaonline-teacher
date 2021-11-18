import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { canEditContent } from '../../../../api/accounts/canEditContent'
import { username } from '../../../../api/accounts/username'
import './navTop.html'

const applicationName = Meteor.settings.public.app.name

Template.navTop.helpers({
  applicationName () {
    return applicationName
  },
  canEditContent (user) {
    return canEditContent(user)
  },
  username (user) {
    return username(user)
  }
})
