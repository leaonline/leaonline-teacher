import { Mongo } from 'meteor/mongo'
import { MyCourses } from '../../api/collections/MyCourses'
import { Schema } from '../../api/schema/Schema'

const collection = new Mongo.Collection(null)
// const coursesSchema = Schema.create(MyCourses.schema)
// collection.attachSchema(coursesSchema)

MyCourses.collection = () => collection
