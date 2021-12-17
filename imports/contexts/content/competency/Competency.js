import { Competency } from 'meteor/leaonline:corelib/contexts/Competency'
import { createGetMethod } from '../../../api/decorators/createGetMethod'

Competency.api = {}

Competency.api.insert = (insertDoc) => {
  return Competency.collection().insert(insertDoc)
}

Competency.api.update = (updateDoc) => {
  return Competency.collection().update(updateDoc)
}

Competency.methods = Competency.methods || {}

Competency.methods.get = createGetMethod({ context: Competency })

export { Competency }
