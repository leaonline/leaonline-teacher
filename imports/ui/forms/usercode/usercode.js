/* global AutoForm */
import { Template } from 'meteor/templating'
import { OtuLea } from '../../../api/remotes/OtuLea'
import { debounce } from '../../utils/debounce'
import './usercode.html'

AutoForm.addInputType('usercode', { template: 'afUserCode' })

const isDef = x => x !== undefined

Template.afUserCode.onCreated(function () {
  const instance = this
  const updateValue = (name, value) => instance.$(`.${name}`).val(value)

  instance.init({
    remotes: [OtuLea],
    onComplete () {
      instance.state.set('initComplete', true)
    }
  })

  instance.updateValues = ({ _id, username, code, firstName, lastName, valid }) => {
    if (isDef(_id)) updateValue('id-input', _id)
    if (isDef(username) || isDef(code)) updateValue('code-input', username || code)
    if (isDef(firstName)) updateValue('first-name-input', firstName)
    if (isDef(lastName)) updateValue('last-name-input', lastName)
    if (typeof valid === 'boolean') {
      updateValue('valid-input', valid)
      instance.state.set('isValid', valid)
    }
    if (valid === null) {
      updateValue('valid-input', null)
      instance.state.set('isValid', null)
    }
  }
})

Template.afUserCode.onRendered(function () {
  const instance = this
  instance.updateValues(instance.data.value)
})

Template.afUserCode.helpers({
  key (name) {
    return Template.currentData().name + '.' + name
  },
  generating () {
    return Template.getState('generating')
  },
  isValid () {
    return Template.getState('isValid') === true
  },
  isInvalid () {
    return Template.getState('isValid') === false
  },
  checking () {
    return Template.getState('checking')
  },
  loadComplete () {
    return Template.getState('initComplete')
  }
})

Template.afUserCode.events({
  'click .code-gen-btn': async function (event, templateInstance) {
    event.preventDefault()

    templateInstance.state.set('generating', true)
    const userDoc = await OtuLea.generateUser()
    userDoc.valid = true

    templateInstance.updateValues(userDoc)
    templateInstance.state.set({
      generating: false
    })
  },
  'input .code-input': debounce(function (event, templateInstance) {
    templateInstance.state.set('checking', true)

    const code = (templateInstance.$(event.currentTarget).val() || '').toUpperCase()
    let isValid

    if (code.length === 0) {
      isValid = null
      setTimeout(() => {
        templateInstance.updateValues({ valid: isValid })
        templateInstance.state.set({ isValid, checking: false })
      }, 1000)
    }

    else if (code.length < templateInstance.data.atts.codeLength) {
      isValid = false
      setTimeout(() => {
        templateInstance.updateValues({ valid: false })
        templateInstance.state.set({ isValid, checking: false })
      }, 1000)
    }

    else {
      OtuLea.userExists({ code })
        .catch(e => {
          console.error(e)
          templateInstance.state.set({ isValid: false, checking: false })
        })
        .then((userDoc = {}) => {
          if (userDoc.username !== code) {
            templateInstance.updateValues({
              _id: null,
              valid: false
            })
            templateInstance.state.set({ isValid: false, checking: false })
          }
          else {
            userDoc.valid = true
            templateInstance.updateValues(userDoc)
            templateInstance.state.set({ isValid: true, checking: false })
          }
        })
    }
  }, 1000)
})
