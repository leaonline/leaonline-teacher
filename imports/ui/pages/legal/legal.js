import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Legal } from '../../../contexts/legal/Legal'
import settings from '../../../../resources/i18n/de/routes'
import legalLanguage from './i18n/legalLanguage'
import { marked } from 'marked'
import { i18n } from '../../../api/i18n/I18n'
import './legal.html'

Template.legal.onCreated(function () {
  const instance = this
  instance.init({
    contexts: [Legal],
    useLanguage: [legalLanguage],
    debug: false,
    onComplete: () => {
      instance.state.set('dependenciesComplete', true)
    }
  })

  instance.autorun(() => {
    const dependenciesComplete = instance.state.get('dependenciesComplete')
    if (!dependenciesComplete) { return }

    const data = Template.currentData()
    const { type } = data.params
    let originalType

    Object.entries(settings.routes).forEach(([key, value]) => {
      if (type === value) {
        originalType = key
      }
    })

    if (!originalType) {
      instance.state.set({
        error: new Error(i18n.get('legal.unknownKey', { name: originalType }))
      })
    }

    Meteor.call(Legal.methods.get.name, { name: originalType }, (err, legalText) => {
      if (err) return instance.state.set({ error: err })

      const markedOptions = {
        mangle: false,
        breaks: true,
        gfm: true
      }

      marked.parse(legalText, markedOptions, (parsingError, content) => {
        if (parsingError) {
          return instance.state.set({ error: parsingError })
        }

        instance.state.set({ content })
      })
      instance.state.set({ type: originalType })
    })
  })
})

Template.legal.helpers({
  allComplete () {
    return Template.getState('dependenciesComplete') && Template.getState('content')
  },
  dependenciesComplete () {
    return Template.getState('dependenciesComplete')
  },
  content () {
    return Template.getState('content')
  },
  legalTitle () {
    const type = Template.getState('type')
    return `pages.legal.${type}`
  }
})
