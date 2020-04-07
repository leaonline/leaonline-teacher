import { getCreatePublications } from 'meteor/leaonline:factories/publication/createPublication'
import { Schema } from '../api/schema/Schema'

export const createPublications = getCreatePublications(Schema.create)
