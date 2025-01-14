import { CompetencyCategory } from 'meteor/leaonline:corelib/contexts/CompetencyCategory'

CompetencyCategory.api = {}

CompetencyCategory.api.insert = (insertDoc) => {
  return CompetencyCategory.collection().insertAsync(insertDoc)
}

export { CompetencyCategory }
