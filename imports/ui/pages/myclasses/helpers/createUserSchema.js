import { reactiveTranslate } from '../../../../api/i18n/reactiveTranslate'
import { User } from '../../../../contexts/users/User'

export const createUserSchema = () => {
  return User.schema
}