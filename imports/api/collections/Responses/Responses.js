import { normalizeDate } from '../../utils/normalizeDate'

export const Responses = {
  name: 'responses',
  label: 'repsonses.title',
  icon: 'pencil'
}

Responses.schema = {
  userId: String,
  sessionId: String,
  taskId: String,
  answers: {
    type: Array,
    optional: true
  },
  'answers.$': Object,
  'answers.$.interactionId': String,
  'answers.$.value': String
}

Responses.collection = () => {
  throw new Error('abstract function, not yet overridden')
}

Responses.api = {}

/**
 * Transforms a document Object from a HTTP response or JSON file into proper schema-compliant document
 * @param document the document to be normalized
 * @return {Object} schema compliant document
 */

Responses.api.normalize = document => {
  document.createdAt = normalizeDate(document.createdAt)
  document.updatedAt = normalizeDate(document.updatedAt)
  return document
}
