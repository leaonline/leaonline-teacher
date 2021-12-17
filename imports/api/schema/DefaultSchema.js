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
  },
  'meta.sharedWith': {
    type: Array,
    optional: true
  },
  'meta.sharedWith.$': {
    type: String
    /*
    custom () {
      if (Meteor.users.find(this.value).count() > 0) {
        return // user exists
      }

      const label = translate('accounts.invalidAccount')
      return typeof label === 'function'
        ? label()
        : label
    }
    */
  }
}
