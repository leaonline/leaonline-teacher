import { ContentDefinitions } from '../../../contexts/content/ContentDefinitions'
import { Admin } from '../../../contexts/admin/Admin'
import { dataTarget } from '../../utils/dataTarget'
import { callMethod } from '../../../infrastructure/methods/callMethod'
import contentLanguage from './i18n/contentLanguage'
import { reactiveTranslate } from '../../../api/i18n/reactiveTranslate'
import './content.html'

Template.content.onCreated(function () {
  const instance = this
  instance.init({
    contexts: ContentDefinitions.all(),
    useLanguage: contentLanguage,
    onComplete () {
      instance.state.set('initComplete', true)
    }
  })
})

Template.content.helpers({
  loadComplete () {
    return Template.getState('initComplete')
  },
  content () {
    return ContentDefinitions.all()
  },
  syncing (name) {
    return Template.getState('syncing') === name
  }
})

Template.content.events({
  'click .sync-button' (event, templateInstance) {
    event.preventDefault()

    const name = dataTarget(event)
    const ctx = ContentDefinitions.get(name)

    setTimeout(() => callMethod({
      name: Admin.methods.sync,
      args: { name },
      prepare: () => templateInstance.state.set('syncing', name),
      receive: () => templateInstance.state.set('syncing', null),
      failure: error => templateInstance.api.notify(error),
      success: ({ updated }) => {
        templateInstance.api.notify({
          type: 'success',
          title: reactiveTranslate('actions.successful'),
          message: reactiveTranslate('pages.content.updated', { updated, label: ctx.label }),
          icon: 'check'
        })
      }
    }), 300)
  }
})
