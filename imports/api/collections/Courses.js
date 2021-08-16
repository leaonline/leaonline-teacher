import { createInsertMethod } from '../decorators/createInsertMethod'
import { callMethod } from '../../infrastructure/methods/callMethod'
import { createMyPublication } from '../decorators/createMyPublication'
import { createRemoveMethod } from '../decorators/createRemoveMethod'
import { createUpdateMethod } from '../decorators/createUpdateMethod'

export const Courses = {
  name: 'courses',
  label: 'courses.title',
  icon: 'users'
}

Courses.schema = (translate = x => x) => ({
  title: {
    type: String,
    autoform: {
      placeHolder: translate('common.title')
    }
  },
  startsAt: {
    type: Date,
    optional: true,
    autoform: {
      placeHolder: translate('common.startsAt')
    }
  },
  startedAt: {
    type: Date,
    optional: true,
    autoform: {
      placeHolder: translate('common.startedAt')
    }
  },
  completesAt: {
    type: Date,
    optional: true,
    autoform: {
      placeHolder: translate('common.startedAt')
    }
  },
  completedAt: {
    type: Date,
    optional: true,
    autoform: {
      placeHolder: translate('common.completedAt')
    }
  },

  // users array example data:
  // [ { id: 'x0at2' , firstName: 'John', lastName: 'Doe' } ]
  users: {
    type: Array,
    optional: true,
    label: false
  },
  'users.$': {
    type: Object,
    label: false,
    autoform: {
      afObjectField: {
        bodyClass: 'row border-0 py-0 pl-2, pr-0'
      }
    }
  },
  'users.$._id': {
    type: String,
    max: 17,
    optional: true,
    autoform: {
      type: 'hidden'
    }
  },
  'users.$.lastName': {
    type: String,
    autoform: {
      label: false,
      placeHolder: translate('common.lastName'),
      afFormGroup: {
        'formgroup-class': 'col-md-6'
      }
    }
  },
  'users.$.firstName': {
    type: String,
    autoform: {
      label: false,
      placeHolder: translate('common.firstName'),
      afFormGroup: {
        'formgroup-class': 'col-md-6'
      }
    }
  },
  'users.$.code': {
    type: String,
    max: 5,
    optional: true,
    autoform: {
      type: 'hidden'
    }
  },
})

Courses.api = {}

Courses.api.insert = async (insertDoc) => {
  return callMethod({
    name: Courses.methods.insert,
    args: insertDoc
  })
}

Courses.api.update = async (updateDoc) => {
  return callMethod({
    name: Courses.methods.update,
    args: updateDoc
  })
}

Courses.api.remove = async (_id) => {
  return callMethod({
    name: Courses.methods.remove,
    args: { _id }
  })
}

Courses.methods = {}
Courses.methods.insert = createInsertMethod({ context: Courses })
Courses.methods.update = createUpdateMethod({ context: Courses })
Courses.methods.remove = createRemoveMethod({ context: Courses })

Courses.publications = {}
Courses.publications.my = createMyPublication({ context: Courses })

Courses.publications.all = {
  name: 'courses.publications.all',
  schema: {},
  run: () => Courses.collection().find()
}