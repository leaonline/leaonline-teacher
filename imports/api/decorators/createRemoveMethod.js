import { onServer } from '../../utils/arch'
import { Meteor } from 'meteor/meteor'

export const createRemoveMethod = ({ context, run }) => {
  const { name } = context
  return {
    name: `${name}.methods.remove`,
    backend: true,
    schema: {
      _id: String
    },
    run: onServer(run || function ({ _id }) {
      const Collection = context.collection()
      if (!Collection) {
        throw new Meteor.Error('update.error', 'errors.collectionUndefined', { name })
      }

      if (Collection.find({ _id, 'meta.createdBy': this.userId }).count() < 1) {
        throw new Meteor.Error('update.error', 'errors.docNotFound', {
          name,
          _id
        })
      }

      return context.collection().remove({ _id })
    })
  }
}
