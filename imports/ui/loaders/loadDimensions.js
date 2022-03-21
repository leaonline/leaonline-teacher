import { callMethod } from '../../infrastructure/methods/callMethod'
import { Dimension } from '../../contexts/content/dimension/Dimension'

let loaded = false

/**
 * Ensures that dimensions are loaded only once across the whole client app.
 * @return {Promise<boolean>}
 */
export const loadDimensions = async () => {
  if (loaded) {
    return Dimension.localCollection().find().fetch()
  }

  const dimensionDocs = await callMethod({
    name: Dimension.methods.all,
    args: {}
  })

  dimensionDocs.forEach(doc => {
    if (doc.isLegacy === false) { return } // skip non-otu.lea
    Dimension.localCollection().upsert(doc._id, { $set: doc })
  })

  loaded = Dimension.localCollection().find().count() > 0

  return dimensionDocs
}
