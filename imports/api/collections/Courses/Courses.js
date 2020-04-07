export const Courses = {
  name: 'courses',
  label: 'courses.title',
  icon: 'th-large'
}

Courses.schema = {
  _id: String,
  createdBy: String,
  createdAt: Date,
  updatedAt: Date,
  title: String,
  startedAt: Date,
  completedAt: Date,
  users: Array,
  'users.$': String
}

Courses.collection = () => {
  throw new Error('abstract function, not yet overridden')
}

Courses.api = {}

/**
 * Returns a Mongo.Cursor to all of my courses.
 * @return {Cursor}
 */
Courses.api.myCourses = () => Courses.collection().find({}, { sort: { title: 1 } })
