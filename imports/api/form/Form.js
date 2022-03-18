/* global AutoForm */
import { ReactiveVar } from 'meteor/reactive-var'
import 'meteor/aldeed:autoform/dynamic'
import { formIsValid } from 'meteor/leaonline:corelib/utils/form'
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

  // TODO move template-specific forms to template init-level
  await import('../../ui/forms/usercode/usercode')
  await import('../../ui/forms/courseUsers/courseUsers')
}

Form.getFormValues = ({ formId, schema, templateInstance, isUpdate, clean }) => {
  return formIsValid(formId, schema, { templateInstance, isUpdate })
}

Form.reset = formId => resetForm(formId)
