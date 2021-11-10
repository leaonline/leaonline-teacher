import { createInsertMethod } from '../../api/decorators/createInsertMethod'
import { callMethod } from '../../infrastructure/methods/callMethod'
import { createMyPublication } from '../../api/decorators/createMyPublication'
import { createRemoveMethod } from '../../api/decorators/createRemoveMethod'
import { createUpdateMethod } from '../../api/decorators/createUpdateMethod'
import { createGetMethod } from '../../api/decorators/createGetMethod'

export const Course = {
  name: 'course',
  label: 'courses.title',
  icon: 'users'
}

Course.schema = (translate = x => x) => ({
  title: {
    type: String,
    label: translate('common.title')
  },
  startsAt: {
    type: Date,
    label: translate('course.startsAt')
  },
  completesAt: {
    type: Date,
    label: translate('course.completesAt')
  },

  // users array example data:
  // [ { id: 'x0at2' , firstName: 'John', lastName: 'Doe' } ]
  users: {
    type: Array,
    optional: true,
    label: translate('course.users')
  },
  'users.$': {
    type: Object,
    label: false,
    autoform: {
      type: 'usercode',
      codeLength: 5
    },
    custom () {
      if (!this.isSet || this.value.valid === true) {
        return // all good if not defined or valid
      }
      console.debug('invalid', this.key)
      const label = translate('accounts.invalidCode')
      return typeof label === 'function'
        ? label()
        : label
    }
  },
  'users.$._id': {
    type: String,
    max: 17,
    optional: true
  },
  'users.$.valid': {
    type: Boolean,
    optional: true
  },
  'users.$.code': {
    type: String,
    max: 5,
    optional: true
  },
  'users.$.lastName': {
    type: String,
    optional: true
  },
  'users.$.firstName': {
    type: String,
    optional: true
  }
})

Course.api = {}

Course.api.insert = async (insertDoc) => {
  return callMethod({
    name: Course.methods.insert,
    args: insertDoc
  })
}

Course.api.update = async (updateDoc) => {
  return callMethod({
    name: Course.methods.update,
    args: updateDoc
  })
}

Course.api.remove = async (_id) => {
  return callMethod({
    name: Course.methods.remove,
    args: { _id }
  })
}

Course.methods = {}
Course.methods.get = createGetMethod({ context: Course })
Course.methods.insert = createInsertMethod({ context: Course })
Course.methods.update = createUpdateMethod({ context: Course })
Course.methods.remove = createRemoveMethod({ context: Course })

Course.publications = {}
Course.publications.my = createMyPublication({ context: Course })

Course.publications.all = {
  name: 'courses.publications.all',
  schema: {},
  run: () => Course.collection().find()
}

Course.language = {
  de: () => import('./i18n/de')
}
