import { i18n } from './I18n'

export const reactiveTranslate = (...params) => () => i18n.get(...params)
