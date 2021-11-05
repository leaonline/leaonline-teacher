import { createInsertMethod } from '../../api/decorators/createInsertMethod'
import { callMethod } from '../../infrastructure/methods/callMethod'
import { createMyPublication } from '../../api/decorators/createMyPublication'
import { createRemoveMethod } from '../../api/decorators/createRemoveMethod'
import { createUpdateMethod } from '../../api/decorators/createUpdateMethod'

export const Course = {
  name: 'course',
  label: 'courses.title',
  icon: 'users'
}

Course.schema = (translate = x => x) => ({
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
      placeHolder: translate('course.startsAt')
    }
  },
  startedAt: {
    type: Date,
    optional: true,
    autoform: {
      placeHolder: translate('course.startedAt')
    }
  },
  completesAt: {
    type: Date,
    optional: true,
    autoform: {
      placeHolder: translate('course.startedAt')
    }
  },
  completedAt: {
    type: Date,
    optional: true,
    autoform: {
      placeHolder: translate('course.completedAt')
    }
  },

  // users array example data:
  // [ { id: 'x0at2' , firstName: 'John', lastName: 'Doe' } ]
  users: {
    type: Array,
    optional: true,
    label:  translate('common.users'),
  },
  'users.$': {
    type: Object,
    label:false,
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
  'users.$.code': {
    type: String,
    max: 5,
    optional: true,
    autoform: {
      label: false,
      placeHolder: translate('common.code'),
      afFormGroup: {
        'formgroup-class': 'col-md-2'
      }
    }
  },
  'users.$.lastName': {
    type: String,
    optional: true,
    autoform: {
      label: false,
      placeHolder: translate('common.lastName'),
      afFormGroup: {
        'formgroup-class': 'col-md-5'
      }
    }
  },
  'users.$.firstName': {
    type: String,
    optional: true,
    autoform: {
      label: false,
      placeHolder: translate('common.firstName'),
      afFormGroup: {
        'formgroup-class': 'col-md-5'
      }
    }
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
