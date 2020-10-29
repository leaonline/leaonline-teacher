import { reactiveTranslate } from '../i18n/reactiveTranslate'

export const MyCourses = {
  name: 'myCourses',
  label: 'myCourses.title',
  icon: 'users'
}

MyCourses.schema = {
  title: {
    type: String,
    label: false,
    autoform: {
      placeHolder: reactiveTranslate('common.title')
    }
  },
  startedAt: {
    type: Date,
    label: false,
    optional: true,
    autoform: {
      placeHolder: reactiveTranslate('common.startedAt')
    }
  },
  completedAt: {
    type: Date,
    label: false,
    optional: true,
    autoform: {
      placeHolder: reactiveTranslate('common.completedAt')
    }
  },

  // users array example data:
  // [ { id: 'x0at2' , firstName: 'John', lastName: 'Doe' } ]
  users: {
    type: Array,
    optional: true,
    label: false,
    autoform: {
      afFormGroup: {
        class: 'border-0 bg-danger'
      }
    }
  },
  'users.$': {
    type: Object,
    label: false,
    autoform: {
      afFormGroup: {
        class: 'border-0 bg-danger'
      },
      afObjectField: {
        bodyClass: 'row border-0'
      }
    }
  },
  'users.$.id': {
    type: String,
    max: 5,
    autoform: {
      label: false,
      placeHolder: 'ID',
      afFormGroup: {
        class: ''
      }
    }
  },
  'users.$.firstName': {
    type: String,
    autoform: {
      label: false,
      placeHolder: 'First Name',
      afFormGroup: {
        class: ''
      }
    }
  },
  'users.$.lastName': {
    type: String,
    autoform: {
      label: false,
      placeHolder: 'Last Name',
      afFormGroup: {
        class: ''
      }
    }
  }
}

MyCourses.api = {}

MyCourses.api.insert = (insertDoc) => {
  // TODO send later to server via Meteor.call
  return MyCourses.collection().insert(insertDoc)
}

MyCourses.api.update = (_id, updateDoc) => {
  // TODO send later to server via Meteor.call
  return MyCourses.collection().update(_id, { $set: updateDoc })
}

MyCourses.api.remove = (_id) => {
  // TODO send later to server via Meteor.call
  return MyCourses.collection().remove(_id)
}
