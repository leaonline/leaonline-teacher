export const Competency = {
  name: 'competency'
}

Competency.schema = {
  _id: {
    type: String
  },
  title: {
    type: String
  },
  competencyCategory: {
    type: String,
    optional: true
  },
  description: {
    type: String
  },
  help: {
    type: String
  },
  alphaLevel: {
    type: Number,
    optional: true
  }
}

Competency.api = {}

Competency.api.insert = (insertDoc) => {
  return Competency.collection().insert(insertDoc)
}

Competency.api.update = (updateDoc) => {
  return Competency.collection().update(updateDoc)
}
