export const DefaultSchema = {
  _id: {
    type: String,
    optional: true
  },
  meta: {
    type: Object,
    optional: true
  },
  'meta.createdBy': {
    type: String,
    optional: true
  },
  'meta.createdAt': {
    type: Date,
    optional: true
  },
  'meta.updatedBy': {
    type: String,
    optional: true
  },
  'meta.updatedAt': {
    type: Date,
    optional: true
  }
}
