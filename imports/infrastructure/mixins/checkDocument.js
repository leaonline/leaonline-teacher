import { DocNotFoundError } from '../../contexts/errors/DocNotFoundError'

/**
 * Throws an error, if a document does not exist.
 * @param document {Object} the document to check
 * @param context {Object} the context corresponding to the document
 * @param details {any|undefined} optional details
 */

export const checkDocument = (document, context, details = undefined) => {
  if (!document) {
    throw new DocNotFoundError(context.name, details)
  }
}
