import { Competency } from 'meteor/leaonline:corelib/contexts/Competency'

Competency.api = {}

Competency.api.insert = (insertDoc) => {
  return Competency.collection().insert(insertDoc)
}

Competency.api.update = (updateDoc) => {
  return Competency.collection().update(updateDoc)
}

export { Competency }
