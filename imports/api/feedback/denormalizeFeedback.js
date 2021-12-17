/**
 *
 * @param feedback
 * @return {{
 *   alphaLevels: [AlphaLevel],
 *   alphaLevelIds: [String],
 *   competencies: [Competency],
 *   competencyIds: [String]}}
 */
export const denormalizeFeedback = ({ feedback }) => {
  const alphaLevels = new Map()
  const alphaLevelIds = new Set()
  const competencies = new Map()
  const competencyIds = new Set()
  const addToAlpha = addToMap(alphaLevels, alphaLevelIds, 'alphaLevelId')
  const addToComps = addToMap(competencies, competencyIds, 'competencyId')

  feedback.forEach(entry => {
    (entry.alphaLevels || []).forEach(addToAlpha)
    ;(entry.competencies || []).forEach(addToComps)
  })

  return {
    alphaLevels: Array.from(alphaLevels.values()),
    alphaLevelIds: Array.from(alphaLevelIds),
    competencies: Array.from(competencies.values()),
    competencyIds: Array.from(competencyIds)
  }
}

const addToMap = (map, idSet, idName) => (entry) => {
  if (!entry.isGraded) return

  const perc = entry.perc
  const id = entry[idName]
  const existingScore = map.get(id) || { id, score: 0, sum: 0, count: 0 }

  existingScore.count++
  existingScore.sum += existingScore.sum + perc
  existingScore.score = existingScore.sum / existingScore.count
  map.set(id, existingScore)
  idSet.add(id)
}
