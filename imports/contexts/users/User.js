import { createInsertMethod } from '../../api/decorators/createInsertMethod'
import { createShareWithDecorator } from '../../api/decorators/createShareWithDecorator'
import { createUpdateMethod } from '../../api/decorators/createUpdateMethod'
import { createGetMethod } from '../../api/decorators/createGetMethod'
import { createMyPublication } from '../../api/decorators/createMyPublication'
import { createRemoveMethod } from '../../api/decorators/createRemoveMethod'

/**
 * This definition represents a user in terms of a User attendee or someone
 * who uses otu.lea or lea.app and can be connected via code with this app.
 */
export const User = {
  name: 'user',
  label: 'user.title',
  icon: 'user'
}

User.schema =  (translate = x => x) => ({
  firstName: {
    type: String,
    optional: true,
    label: translate('user.firstName')
  },
  lastName: {
    type: String,
    optional: true,
    label: translate('user.lastName')
  },
  account: {
    type: Object,
    optional: true,
    label: translate('user.code'),
    autoform: {
      type: 'usercode'
    }
  },
  'account._id': {
    type: String,
    max: 17,
    optional: true
  },
  'account.isValid': {
    type: Boolean,
    optional: true
  },
  'account.code': {
    type: String,
    max: 5,
    optional: true
  }
})

User.methods = {}
User.methods.get = createGetMethod({ context: User })
User.methods.insert = createInsertMethod({ context: User })
User.methods.update = createUpdateMethod({ context: User })
User.methods.remove = createRemoveMethod({ context: User })
User.methods.shareWith = createShareWithDecorator({ context: User })

User.publications = {}
User.publications.my = createMyPublication({ context: User })

User.language = {
  de: () => import('./i18n/de')
}