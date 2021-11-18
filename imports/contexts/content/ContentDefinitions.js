import { Dimension } from './dimension/Dimension'
import { Competency } from './competency/Competency'
import { CompetencyCategory } from './competency/CompetencyCategory'

const map = new Map()
map.set(Dimension.name, Dimension)
map.set(Competency.name, Competency)
map.set(CompetencyCategory.name, CompetencyCategory)

export const ContentDefinitions = {}

ContentDefinitions.get = name => map.get(name)

ContentDefinitions.all = () => Array.from(map.values())
