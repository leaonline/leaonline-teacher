import { callMethod } from '../../infrastructure/methods/callMethod'
import { Competency } from '../../contexts/content/competency/Competency'

export const loadExampleTexts = async ids => {
  debugger
  const docs = await callMethod({
    name: Competency.methods.exampleTexts,
    args: { ids }
  })

  const obj = {}
  docs.forEach(doc => {
    obj[doc._id] = doc.example
  })

  return obj
}
