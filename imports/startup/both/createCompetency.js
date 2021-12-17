import { Mongo } from 'meteor/mongo'
import { Competency } from '../../contexts/content/competency/Competency'
import { Schema } from '../../api/schema/Schema'

const collection = new Mongo.Collection(null)
const competencySchema = Schema.create(Competency.schema)
collection.attachSchema(competencySchema)

Competency.collection = () => collection
