export const cleanUpdateDoc = (updateDoc, originalDoc) => {
  const finalDoc = {}

  Object.entries(updateDoc).forEach(([key, value]) => {
    const originalValue = originalDoc[key]

    if (value !== originalValue) {
      finalDoc[key] = value
    }
  })

  return finalDoc
}
