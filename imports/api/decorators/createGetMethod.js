import { onServer } from '../../utils/arch'

export const createGetMethod = ({ context }) => {
  return {
    name: `${context.name}.methods.get`,
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
    run: onServer(function ({ _id, ids }) {
      if ((Array.isArray(ids))) {
        return context.collection().find({ _id: { $in: ids } }).fetch()
      }
      else {
        return context.collection().findOne(_id)
      }
    })
  }
}
