/* global AutoForm */
import { ReactiveVar } from 'meteor/reactive-var'
import 'meteor/aldeed:autoform/dynamic'
import { formIsValid } from 'meteor/leaonline:corelib/utils/form'
import { AutoFormThemeBootstrap5 } from 'meteor/communitypackages:autoform-bootstrap5/dynamic'
import { resetForm } from '../../ui/utils/form/resetForm'
import { logAnalytics } from '../../ui/analytics/logAnalytics'

export const Form = {}

/**
 * Returning the current initialization status
 */
const initialized = new ReactiveVar(false)

Form.initialize = function () {
  if (!initialized.get()) {
    initialize()
      .catch(error => console.error(error))
      .then(() => initialized.set(true))
  }

  return initialized
}

async function initialize () {
  await AutoForm.load()
  await AutoFormThemeBootstrap5.load()
  await AutoForm.setDefaultTemplate('bootstrap5')

  // TODO move template-specific forms to template init-level
  await import('../../ui/forms/usercode/usercode')
  await import('../../ui/forms/courseUsers/courseUsers')
}

Form.getFormValues = ({ formId, schema, templateInstance, isUpdate, clean }) => {
  const isValid = formIsValid(formId, schema, { isUpdate })
  logAnalytics({
    aid: formId,
    event: 'validate-form',
    template: templateInstance?.viewName ?? templateInstance?.view?.name,
    value: { isUpdate }
  })
  return isValid
}

Form.reset = formId => resetForm(formId)
