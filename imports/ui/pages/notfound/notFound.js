import { Template } from 'meteor/templating'
import { BlazeBootstrap } from '../../../api/blazebootstrap/BlazeBootstrap'
import { bbsComponentLoader } from '../../utils/bbsComponentLoader'
import './notFound.html'

const componentsLoader = bbsComponentLoader([
  BlazeBootstrap.link.load(),
  BlazeBootstrap.card.load(),
  BlazeBootstrap.jumbotron.load()
])

Template.notFound.onCreated(function () {
  const instance = this
  instance.init({
    language: lang => {
      switch (lang) {
        case 'de':
          return import('./i18n/de')
        default:
          throw new Error(`Language not supported: ${lang}`)
      }
    },
    onComplete () {
      instance.state.set('initComplete', true)
    }
  })
})

Template.notFound.helpers({
  componentsLoaded () {
    return componentsLoader.loaded.get() && Template.getState('initComplete')
  }
})
