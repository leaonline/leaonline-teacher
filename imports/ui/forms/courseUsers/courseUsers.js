import { Schema } from '../../../api/schema/Schema'
import { User } from '../../../contexts/users/User'
import { Form } from '../../../api/form/Form'
import { reactiveTranslate } from '../../../api/i18n/reactiveTranslate'
import courseUsersLang from './i18n/courseUsersLang'
import './courseUsers.html'
import { dataTarget } from '../../utils/dataTarget'
import { callMethod } from '../../../infrastructure/methods/callMethod'

AutoForm.addInputType('courseUsers', {
  template: 'afCourseUsers',
  valueOut () {
    const value = this.val()
    return JSON.parse(value || [])
  }
})

// map-functions
const toUserId = user => user._id
const byAddedUser = user => entry => {
  if (!entry.accounts || !user.accounts) { return false }

  return (entry.accounts._id === user.accounts._id) || (entry.accounts.code === user.accounts.code)
}

const userSchemaDef = {
  ...User.schema(reactiveTranslate),
}

userSchemaDef.firstName.autoform = userSchemaDef.firstName.autoform || {}
userSchemaDef.firstName.autoform.placeholder = userSchemaDef.firstName.label
userSchemaDef.firstName.label = false

userSchemaDef.lastName.autoform = userSchemaDef.lastName.autoform || {}
userSchemaDef.lastName.autoform.placeholder = userSchemaDef.lastName.label
userSchemaDef.lastName.label = false

userSchemaDef.account.label = false

const addUserSchema = Schema.create(userSchemaDef)

Template.afCourseUsers.onCreated(function () {
  const instance = this

  instance.init({
    useLanguage: [courseUsersLang],
    onComplete () {
      instance.state.set('initComplete', true)
    }
  })

  instance.users = new Mongo.Collection(null)
  instance.state.set('viewState', 'showUsers')
  instance.updateValue = () => {
    const ids = instance.users.find().map(toUserId)
    instance.$('.afCourseUsersHiddenInput').val(JSON.stringify(ids))
  }

  const { value } = instance.data
  if (value && value.length > 0) {
    User.collection().find({ _id: { $in: value }}).forEach(userDoc => instance.users.insert(userDoc))
  }

  instance.autorun(() => {
    const data = Template.currentData()
    const isInvalid = data.atts.class && data.atts.class.includes('is-invalid')
    instance.state.set({ isInvalid })
  })
})

Template.afCourseUsers.onRendered(function () {
  const instance = this
  instance.updateValue()
})

Template.afCourseUsers.helpers({
  loadComplete () {
    return Template.getState('initComplete')
  },
  addUserSchema () {
    return addUserSchema
  },
  localUsers () {
    return Template.instance().users.find()
  },
  allUsers () {
    const localUsers = Template.instance().users.find().map(toUserId)
    return User.collection().find({ _id: { $nin: localUsers } }, { sort: { lastName: 1, firstName: 1 }})
  },
  dataSchemaKey () {
    return Template.instance().data.atts['data-schema-key']
  },
  isInvalid () {
    return Template.getState('isInvalid')
  },
  state (name) {
    return Template.getState('viewState') === name
  }
})

Template.afCourseUsers.events({
  'click .state-btn' (event, templateInstance) {
    event.preventDefault()
    const viewState = dataTarget(event)
    templateInstance.state.set({ viewState })
  },
  'click .add-user-btn' (event, templateInstance) {
    event.preventDefault()

    const userId = dataTarget(event)
    const user = User.collection().findOne(userId)
    templateInstance.users.insert(user)
    templateInstance.updateValue()
  },
  'click .remove-user-btn' (event, templateInstance) {
    event.preventDefault()

    const userId = dataTarget(event)
    templateInstance.users.remove({ _id: userId })
    templateInstance.updateValue()
  },

  'submit #add-user-form' (event, templateInstance) {
    event.preventDefault()

    const userDoc = Form.getFormValues({
      formId: 'add-user-form',
      schema: addUserSchema
    })

    if (!userDoc) return

    const users = templateInstance.users.find().fetch()
    if (users.find(byAddedUser(userDoc))) {
      // no doubles allowed
      // TODO add sticky error
      return
    }

    callMethod({
      name: User.methods.insert,
      args: userDoc,
      prepare: () => templateInstance.state.set('creating', true),
      receive: () => templateInstance.state.set('creating', false),
      failure: error => console.error(error), // todo add sticky error
      success: userId => {
        Form.reset('add-user-form')
        userDoc._id = userId
        templateInstance.users.insert(userDoc)
        templateInstance.updateValue()
        // notify success?
      }
    })
  }
})