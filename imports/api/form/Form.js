/* global AutoForm */
import { ReactiveVar } from 'meteor/reactive-var'
import 'meteor/aldeed:autoform/dynamic'
import { formIsValid, formReset, validateFormData } from 'meteor/leaonline:corelib/utils/form'
import { AutoFormThemeBootstrap4 } from 'meteor/communitypackages:autoform-bootstrap4/dynamic'
import { resetForm } from '../../ui/utils/form/resetForm'

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
  await AutoFormThemeBootstrap4.load()
  await AutoForm.setDefaultTemplate('bootstrap4')
}

Form.getFormValues = ({ formId, schema, templateInstance, isUpdate }) => {
  return formIsValid(formId, schema, { templateInstance, isUpdate })
}

Form.reset = formId => resetForm(formId)