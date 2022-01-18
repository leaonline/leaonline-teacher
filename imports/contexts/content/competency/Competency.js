import { Competency } from 'meteor/leaonline:corelib/contexts/Competency'
import { createGetMethod } from '../../../api/decorators/createGetMethod'
import { onServerExec } from '../../../utils/arch'

Competency.api = {}

Competency.api.insert = (insertDoc) => {
  return Competency.collection().insert(insertDoc)
}

Competency.api.update = (updateDoc) => {
  return Competency.collection().update(updateDoc)
}

Competency.methods = Competency.methods || {}

Competency.methods.get = createGetMethod({ context: Competency })

Competency.methods.exampleTexts = {
  name: 'competency.methods.exampleTexts',
  schema: {
    ids: Array,
    'ids.$': String
  },
  run: onServerExec(function () {
    const transform = { fields: { _id: 1, example: 1 } }
    return function ({ ids }) {
      console.debug('get competency examples', ids)
      const query = { _id: { $in: ids } }
      return Competency.collection().find(query, transform).fetch()
    }
  })
}

export { Competency }
