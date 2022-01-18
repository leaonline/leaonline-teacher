import { callMethod } from '../../infrastructure/methods/callMethod'
import { CompetencyCategory } from '../../contexts/content/competency/CompetencyCategory'

/**
 * Ensures that dimensions are loaded only once across the whole client app.
 * @return {Promise<boolean>}
 */
export const loadCompetencyCategories = async (ids) => {
  // TODO exclude cached docs from request
  const categoryDocs = await callMethod({
    name: 'competencyCategory.methods.get',
    args: { ids }
  })

  categoryDocs.forEach(doc => {
    CompetencyCategory.localCollection().upsert(doc._id, { $set: doc })
  })

  return categoryDocs
}
