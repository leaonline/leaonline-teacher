import { normalizeDate } from '../../utils/normalizeDate'

export const Feedback = {
  name: 'feedback',
  label: 'feedback.title',
  icon: 'check'
}

Feedback.schema = {
  userId: String,
  sessionId: String,
  url: String,
  tempId: String,
  content: String,
  createdAt: Date,
  userResponse: String
}

Feedback.collection = function () {
  throw new Error('Collection not yet implemented')
}

Feedback.api = {}

/**
 * Transforms a document Object from a HTTP response or JSON file into proper schema-compliant document
 * @param document the document to be normalized
 * @return {Object} schema compliant document
 */

Feedback.api.normalize = document => {
  document.createdAt = normalizeDate(document.createdAt)
  // TODO normalize content
  // TODO normalize userResponse
  return document
}
