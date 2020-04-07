import { getCreateMethods } from 'meteor/leaonline:factories/method/createMethods'
import { Schema } from '../api/schema/Schema'

export const createMethods = getCreateMethods(Schema.create)
