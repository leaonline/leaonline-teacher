import { AutoForm } from 'meteor/aldeed:autoform'

export const formIsValid = (formId, schema, { isUpdate } = {}) => {
  const { insertDoc, updateDoc } = AutoForm.getFormValues(formId)
  const targetDoc = isUpdate
    ? updateDoc
    : insertDoc

  // validation context
  const validationContext = schema.newContext()
  const validationOptions = { modifier: isUpdate }
  validationContext.validate(targetDoc, validationOptions)

  const errors = validationContext.validationErrors()
  if (validationContext.isValid() || errors.length === 0) {
    return targetDoc
  }

  errors.forEach(err => {
    AutoForm.addStickyValidationError(formId, err.key, err.type, err.value)
  })
}
