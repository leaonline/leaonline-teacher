import { ReactiveVar } from 'meteor/reactive-var'
import { i18n } from './I18n'

export const addLanguage = (definitions, onError = e => console.error(e), debug = () => {}) => {
  const loaded = new ReactiveVar()

  // TODO set default from Meteor.settings
  const currentLang = i18n.getLocale() || 'de'
  const asyncLoaderFn = definitions[currentLang]

  if (!asyncLoaderFn) {
    debug('[addLanguage]: no loader function for ', currentLang)
    loaded.set(true)
    return loaded
  }

  debug('[addLanguage]: load translation for', currentLang)
  asyncLoaderFn()
    .then(module => {
      debug('addLanguage]: translation loaded', module.default)
      i18n.add(currentLang, module.default)
    })
    .catch(onError)
    .finally(() => loaded.set(true))

  return loaded
}
