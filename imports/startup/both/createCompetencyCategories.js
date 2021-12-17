import { Mongo } from 'meteor/mongo'
import { CompetencyCategory } from '../../contexts/content/competency/CompetencyCategory'
import { Schema } from '../../api/schema/Schema'

const collection = new Mongo.Collection(null)
const competencyCategoriesSchema = Schema.create(CompetencyCategory.schema)
collection.attachSchema(competencyCategoriesSchema)

CompetencyCategory.collection = () => collection
