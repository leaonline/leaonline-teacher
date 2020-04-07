import { normalizeDate } from '../../utils/normalizeDate'

export const Scores = {
  name: 'scores',
  label: 'scores.title',
  icon: 'star'
}

Scores.schema = {
  userId: String,
  sessionId: String,
  url: String,
  tempId: String,
  content: String,
  createdAt: Date
}

Scores.collection = function () {
  throw new Error('Collection not yet implemented')
}

Scores.api = {}

/**
 * Transforms a document Object from a HTTP response or JSON file into proper schema-compliant document
 * @param document the document to be normalized
 * @return {Object} schema compliant document
 */

Scores.api.normalize = document => {
  document.createdAt = normalizeDate(document.createdAt)
  return document
}
