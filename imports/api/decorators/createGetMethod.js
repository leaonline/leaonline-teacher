import { onServer } from '../../utils/arch'
import { Meteor } from 'meteor/meteor'

export const createGetMethod = ({ context }) => {
  const { name } = context
  return {
    name: `${name}.methods.get`,
    schema: {
      _id: {
        type: String,
        optional: true
      },
      ids: {
        type: Array,
        optional: true
      },
      'ids.$': String
    },
    run: onServer(function ({ _id, ids } = {}) {
      const Collection = context.collection?.()
      if (!Collection) {
        throw new Meteor.Error('get.error', 'errors.collectionUndefined', { name })
      }

      if ((Array.isArray(ids))) {
        return Collection.find({ _id: { $in: ids } }).fetch()
      }
      else {
        return Collection.findOne(_id)
      }
    })
  }
}
