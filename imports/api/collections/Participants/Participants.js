import { normalizeDate } from '../../utils/normalizeDate'

export const Participants = {
  name: 'participants',
  label: 'participants.title',
  icon: 'users',
  methods: {},
  publications: {}
}

Participants.schema = {
  _id: String,
  username: String,
  createdAt: Date,
  updatedAt: Date
}

Participants.collection = () => {
  throw new Error('abstract function, not yet overridden')
}

Participants.api = {}

/**
 * Transforms a document Object from a HTTP response or JSON file into proper schema-compliant document
 * @param document the document to be normalized
 * @return {Object} schema compliant document
 */

Participants.api.normalize = document => {
  document.createdAt = normalizeDate(document.createdAt)
  document.updatedAt = normalizeDate(document.updatedAt)
  return document
}
