/**
 * Takes an AutoForm updateDoc (via getFormValues) and transforms it into a normal document.
 * @param $set
 * @param $unset
 * @return {Object} An Object with merged modifiers
 */
export const transformUpdateDoc = ({ $set, $unset }) => {
  const document = {}
  Object.entries($set).forEach(([key, value]) => {
     // better than document[key] = value is the following
    Object.defineProperty(document, key, { value })
  })
  Object.keys($unset).forEach(key => {
    // better than document[key] = value is the following
    Object.defineProperty(document, key, { value: null })
  })
  return document
}
