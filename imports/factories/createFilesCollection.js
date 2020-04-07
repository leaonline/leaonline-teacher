import { getCreateFilesCollection } from 'meteor/leaonline:factories/collection/createFilesCollection'
import { i18n } from '../api/i18n/I18n'

export const createFilesCollection = getCreateFilesCollection({ i18n })
