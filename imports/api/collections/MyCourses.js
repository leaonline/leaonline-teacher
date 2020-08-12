import { reactiveTranslate } from '../i18n/reactiveTranslate'

export const MyCourses = {
  name: 'myCourses',
  label: 'myCourses.title',
  icon: 'users'
}

MyCourses.schema = {
  title: {
    type: String,
    label: reactiveTranslate('common.title')
  },
  startedAt: {
    type: Date,
    label: reactiveTranslate('common.startedAt'),
    optional: true
  },
  completedAt: {
    type: Date,
    label: reactiveTranslate('common.completedAt'),
    optional: true
  },

  // users array example data:
  // [ { id: 'x0at2' , firstName: 'John', lastName: 'Doe' } ]
  users: {
    type: Array,
    optional: true
  },
  'users.$': {
    type: Object
  },
  'users.$.id': {
    type: String
  },
  'users.$.firstName': {
    type: String
  },
  'users.$.lastName': {
    type: String
  }
}

MyCourses.api = {}

MyCourses.api.insert = (insertDoc) => {
  // TODO send later to server via Meteor.call
  return MyCourses.collection().insert(insertDoc)
}

MyCourses.api.update = (updateDoc) => {
  // TODO send later to server via Meteor.call
  return MyCourses.collection().update(updateDoc._id, { $set: updateDoc })
}

MyCourses.api.remove = (_id) => {
  // TODO send later to server via Meteor.call
  return MyCourses.collection().remove(_id)
}

