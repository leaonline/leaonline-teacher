import { Template } from 'meteor/templating'
import { Blaze } from 'meteor/blaze'
import { Notify } from './Notify'
import './notifications.scss'
import './notifications.html'

Template.notifications.onCreated(function () {
  const instance = this
  instance.init({
    onComplete () {
      instance.state.set('initComplete', true)
    }
  })
})

Template.notifications.helpers({
  loadComplete () {
    return Template.getState('initComplete')
  },
  queue () {
    return Object.values(Notify.getAll())
  }
})

Template.notifications.onRendered(function () {
  const instance = this

  // parent node for dynamic rendering
  let parent

  instance.autorun(() => {
    if (!instance.state.get('initComplete') || Notify.isEmpty()) {
      return
    }

    if (!parent) {
      parent = instance.$('#notification-target').get(0)
    }

    const data = Notify.get()
    Blaze.renderWithData(Template.notification, data, parent)
  })
})

Template.notification.onRendered(function () {
  const instance = this
  instance.$('.toast').toast('show')
})

Template.notification.events({
  'hidden.bs.toast' (event, templateInstance) {
    console.debug('hidden', event.currentTarget.getAttribute('id'))
  }
})
