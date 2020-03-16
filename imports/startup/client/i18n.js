import {i18n } from '../../api/i18n/I18n'
import en from '../../../resources/i18n/en.json'

const config =  {
  settings: { //--> Config object
    defaultLocale: "en",
    en: {
      code: "en",
      isoCode: "en-US",
      name: "English"
    }
  },
  en: en
}

i18n.load(config)
