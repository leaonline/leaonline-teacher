import { Competency } from 'meteor/leaonline:corelib/contexts/Competency'
import { onServerExec } from '../../../utils/arch'

Competency.methods = Competency.methods || {}

Competency.methods.exampleTexts = {
  name: 'competency.methods.exampleTexts',
  schema: {
    ids: Array,
    'ids.$': String
  },
  run: onServerExec(function () {
    const transform = { fields: { _id: 1, example: 1 } }
    return function ({ ids }) {
      const query = { _id: { $in: ids } }
      return Competency.collection().find(query, transform).fetch()
    }
  })
}

export { Competency }
