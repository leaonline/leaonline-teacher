import { ReactiveVar } from 'meteor/reactive-var'
import I18N from 'meteor/ostrio:i18n'

const _loaded = new ReactiveVar(false)
const fallback = {
  get: x => x,
  addl10n: () => {},
  currentLocale: {
    get: () => 'en'
  }
}

let _translator = fallback

export const i18n = {}

i18n.load = function (config) {
  _translator = new I18N({ i18n: config })
  _loaded.set(true)
}

i18n.get = function (...params) {
  return _translator.get(...params)
}

i18n.add =  function (lang, options) {
  return _translator.addl10n({ [lang]: options })
}

i18n.getLocale = function () {
  return _translator.currentLocale.get()
}

i18n.loaded = function () {
  return _loaded.get()
}