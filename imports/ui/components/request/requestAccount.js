import { Template } from 'meteor/templating'
import { Schema } from '../../../api/schema/Schema'
import { Form } from '../../../api/form/Form'
import { reactiveTranslate } from '../../../api/i18n/reactiveTranslate'
import requestLanguages from './i18n/requestLanguages'
import './requestAccount.html'
import { callMethod } from '../../../infrastructure/methods/callMethod'
import { Users } from '../../../contexts/Users'

const requestSchema = Schema.create({
  email: {
    type: String,
    regEx: Schema.provider.RegEx.EmailWithTLD,
    label: reactiveTranslate('request.email'),
    autoform: {
      type: 'email'
    }
  },
  firstName: {
    type: String,
    label: reactiveTranslate('request.firstName')
  },
  lastName: {
    type: String,
    label: reactiveTranslate('request.lastName')
  },
  institution: {
    type: String,
    label: reactiveTranslate('request.institution')
  },
  comment: {
    type: String,
    optional: true,
    label: reactiveTranslate('request.comment')
  }
})

const formLoaded = Form.initialize()

Template.requestAccount.onCreated(function () {
  const instance = this

  instance.init({
    useLanguage: [requestLanguages],
    onComplete () {
      instance.state.set('initComplete', true)
    },
    onError (err) {
      instance.state.set('loginError', err)
    }
  })
})

Template.requestAccount.helpers({
  requestSchema () {
    return requestSchema
  },
  loadComplete () {
    return formLoaded.get() && Template.getState('initComplete')
  },
  sending () {
    return Template.getState('sending')
  },
  complete () {
    return Template.getState('sendComplete')
  }
})

Template.requestAccount.events({
  'submit #requestForm' (event, templateInstance) {
    event.preventDefault()

    const insertDoc = Form.getFormValues({
      formId: 'requestForm',
      schema: requestSchema
    })

    if (!insertDoc) return

    callMethod({
      name: Users.methods.requestAccount,
      args: insertDoc,
      prepare: () => templateInstance.state.set('sending', true),
      receive: () => templateInstance.state.set('sending', false),
      failure: err => {
        templateInstance.api.notify(err)
      },
      success: () => {
        templateInstance.state.set('sendComplete', true)
        setTimeout(() => {
          templateInstance.data.complete()
        }, 2000)
      }
    })
  },
  'click .cancel-request-btn' (event, templateInstance) {
    event.preventDefault()
    templateInstance.data.cancel()
  }
})
