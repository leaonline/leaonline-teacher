export const CollectionHooks = {}

CollectionHooks.beforeInsert = function (userId, doc) {
  const timestamp = new Date()
  doc.meta.createdBy = doc.meta.createdBy || userId
  doc.meta.updatedBy = userId
  doc.meta.createdAt = doc.meta.createdAt || timestamp
  doc.meta.updatedAt = timestamp
}

CollectionHooks.beforeUpdate = function (userId, modifier) {
  if (!modifier.$set) {
    modifier.$set = {}
  }

  modifier.$set['meta.updatedBy'] = userId
  modifier.$set['meta.updatedAt'] = new Date()
}
