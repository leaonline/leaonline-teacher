import { Template } from 'meteor/templating'
import { Legal } from '../../../contexts/legal/Legal'
import legalLanguage from './i18n/legalLanguage'
import { createIssuesLink } from './createIssuesLink'
import './legal.html'

const legalRoutes = Object.keys(Legal.schema).map(key => {
  const value = Legal.schema[key]
  return {
    name: key,
    label: value.label
  }
})

Template.legalLinks.onCreated(function () {
  const instance = this

  instance.init({
    useLanguage: [legalLanguage],
    onComplete () {
      instance.state.set('loadComplete', true)
    }
  })
})

Template.legalLinks.helpers({
  loadComplete () {
    return Template.getState('loadComplete')
  },
  legalRoutes () {
    return legalRoutes
  },
  issueLink () {
    return createIssuesLink({ url: window.location.href })
  }
})
