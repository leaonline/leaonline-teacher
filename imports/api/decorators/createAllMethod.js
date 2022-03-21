import { onServer } from '../../utils/arch'
import { Meteor } from 'meteor/meteor'

export const createAllMethod = ({ context }) => {
  const { name } = context
  return {
    name: `${name}.methods.all`,
    schema: {},
    numRequests: 1,
    timeInterval: 5000,
    run: onServer(function () {
      const Collection = context.collection?.()
      if (!Collection) {
        throw new Meteor.Error('get.error', 'errors.collectionUndefined', { name })
      }

      return Collection.find({
        $or: [
          { isLegacy: { $exists: false } },
          { isLegacy: true }
        ]
      }).fetch()
    })
  }
}
