import { createInsertMethod } from '../../api/decorators/createInsertMethod'
import { createMyPublication } from '../../api/decorators/createMyPublication'
import { createRemoveMethod } from '../../api/decorators/createRemoveMethod'
import { createUpdateMethod } from '../../api/decorators/createUpdateMethod'
import { createGetMethod } from '../../api/decorators/createGetMethod'
import { createShareWithDecorator } from '../../api/decorators/createShareWithDecorator'

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

  users: {
    type: Array,
    optional: true,
    autoform: {
      // type: 'users'
    }
  },
  'users.$': {
    type: String
  }
})


Course.methods = {}
Course.methods.get = createGetMethod({ context: Course })
Course.methods.insert = createInsertMethod({ context: Course })
Course.methods.update = createUpdateMethod({ context: Course })
Course.methods.remove = createRemoveMethod({ context: Course })
Course.methods.shareWith = createShareWithDecorator({ context: Course })

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
