import { getCreateCollection } from 'meteor/leaonline:factories/collection/createCollection'
import { Schema } from '../api/schema/Schema'

export const createCollection = getCreateCollection(Schema.create)
