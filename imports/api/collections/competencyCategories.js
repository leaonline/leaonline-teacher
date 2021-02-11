export const CompetencyCategories = {
  name: 'CompetencyCategories'
}

CompetencyCategories.schema = {
  _id: {
    type: String
  },
  title: {
    type: String
  }
}

CompetencyCategories.api = {}

CompetencyCategories.api.insert = (insertDoc) => {
  return CompetencyCategories.collection().insert(insertDoc)
}
