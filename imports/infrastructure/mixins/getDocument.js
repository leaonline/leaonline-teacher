/**
 * Simple wrapper to return a document by id and given context.
 * @param docId
 * @param context
 * @return {any}
 */
export const getDocument = (docId, context) => context.collection().findOne(docId)
