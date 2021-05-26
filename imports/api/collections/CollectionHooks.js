export const CollectionHooks = {}

CollectionHooks.beforeInsert = function (userId, doc) {
  const timestamp = new Date()
  doc.createdBy = userId
  doc.updatedBy = userId
  doc.createdAt = timestamp
  doc.updatedAt = timestamp
}

CollectionHooks.beforeUpdate = function (userId, modifier) {
  if (!modifier.$set) {
    modifier.$set = {}
  }

  modifier.$set.updatedBy = userId
  modifier.$set.updatedAt = new Date()
}