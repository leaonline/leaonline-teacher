import { i18n } from '../i18n/I18n'

export const MyCourses = {
  name: 'myCourses',
  label: 'myCourses.title',
  icon: 'users'
}

MyCourses.schema = {
  title: {
    type: String,
    label: i18n.reactive('common.title')
  },
  startedAt: {
    type: Date,
    label: i18n.reactive('common.startedAt'),
    optional: true
  },
  completedAt: {
    type: Date,
    label: i18n.reactive('common.completedAt')
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
  },
}

MyCourses.api = {}

MyCourses.api.insert = (insertDoc) => {
  // TODO send later to server via Meteor.call
  return collection.insert(insertDoc)
}

MyCourses.api.update = (updateDoc) => {
  // TODO send later to server via Meteor.call
  return collection.update(updateDoc._id, { $set: { updateDoc }})
}

MyCourses.api.remove = (_id) => {
  // TODO send later to server via Meteor.call
  return collection.remove(_id)
}
