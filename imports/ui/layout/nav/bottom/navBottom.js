import { Template } from 'meteor/templating'
import { State } from '../../../../api/session/State'
import navBottomLanguage from './i18n/navBottomLanguage'
import './navBottom.scss'
import './navBottom.html'

// TODO rename to navSideRight

Template.navBottom.onCreated(function () {
  const instance = this
  instance.init({
    useLanguage: [navBottomLanguage],
    onComplete: () => instance.state.set('initComplete', true)
  })
})

Template.navBottom.helpers({
  loadComplete () {
    return Template.getState('initComplete')
  },
  selectedCourse () {
    return State.currentClass()
  },
  isSelected (userId) {
    const user = State.currentParticipant()
    return user && user._id === userId
  },
  shortName (user) {
    if (user.firstName && user.lastName) {
      return `${user.firstName.substring(0, 1)}${user.lastName.substring(0, 1)}`.toUpperCase()
    }
    if (user.firstName) {
      return user.firstName.substring(0, 2)
    }
    if (user.lastName) {
      return user.lastName.substring(0, 2)
    }
    return '...'
  },
  fullName (user) {
    const name = []
    if (user.firstName) name.push(user.firstName)
    if (user.lastName) name.push(user.lastName)
    if (user.account?.code) name.push(user.account?.code)
    return name.join(' ')
  },
  compressedView () {
    return Template.getState('compressedView')
  }
})

Template.navBottom.events({
  'click .sidebar-right-toggle' (event, templateInstance) {
    event.preventDefault()

    const compressedView = templateInstance.state.get('compressedView')
    templateInstance.state.set('compressedView', !compressedView)
  }
})
