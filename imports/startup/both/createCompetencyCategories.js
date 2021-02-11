import { Mongo } from 'meteor/mongo'
import { CompetencyCategories } from '../../api/collections/competencyCategories'
import { Schema } from '../../api/schema/Schema'

const collection = new Mongo.Collection(null)
const competencyCategoriesSchema = Schema.create(CompetencyCategories.schema)
collection.attachSchema(competencyCategoriesSchema)

CompetencyCategories.collection = () => collection
