import { onServer } from '../../utils/arch'
import { Meteor } from 'meteor/meteor'

export const createShareWithDecorator = ({ context }) => {
  const { name } = context
  return {
    name: `${name}.methods.shareWith`,
    schema: {
      // current doc to be shared
      _id: String,
      // _id values of users to share it with
      users: {
        type: Array
      },
      'users.$': String
    },
    run: onServer(async function ({ _id, users = [] } = {}) {
      const Collection = context.collection?.()
      if (!Collection) {
        throw new Meteor.Error('shareWith.error', 'errors.collectionUndefined', {
          name
        })
      }

      const doc = await Collection.findOneAsync(_id)
      if (!doc) {
        throw new Meteor.Error('shareWith.error', 'errors.docNotFound', {
          name,
          _id
        })
      }

      const currentUser = await Meteor.users.findOneAsync(this.userId)
      const institution = currentUser?.services?.lea?.institution

      if (institution) {
        throw new Meteor.Error('shareWith.error', 'accounts.invalidInstitution', {
          name,
          institution
        })
      }

      // we now check, if all requested users exist and if they
      // are also in the same institution, otherwise we throw
      const userQuery = {
        _id: { $in: users },
        institution: institution
      }

      if (await Meteor.users.countDocuments(userQuery) !== users.length) {
        throw new Meteor.Error('shareWith.error', 'shareWith.userNotExists', {
          name,
          users
        })
      }

      return Collection.updateAsync(_id, { $set: { 'meta.shareWith': users } })
    })
  }
}
