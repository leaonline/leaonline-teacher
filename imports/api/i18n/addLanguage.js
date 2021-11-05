import { ReactiveVar } from 'meteor/reactive-var'
import { i18n } from './I18n'



export const addLanguage = (asyncLoaderFn, debug = () => {}) => {
  const loaded = new ReactiveVar()
  const currentLang = i18n.getLocale() || 'de'
  debug('[addLanguage]: load translation for', currentLang)
  asyncLoaderFn(currentLang)
    .then(module => {
      debug('addLanguage]: translation loaded', module.default)
      i18n.add(currentLang, module.default)
    })
    .catch(e => console.error(e))
    .finally(() => loaded.set(true))

  return loaded
}
