import { i18n } from '../../api/i18n/I18n'
import defaultRoutes from '../../../resources/i18n/routes'

const config = {
  settings: { // --> Config object
    defaultLocale: 'en',
    en: {
      code: 'en',
      isoCode: 'en-US',
      name: 'English'
    }
  },
  en: defaultRoutes
}

i18n.load(config)

import('../../../resources/i18n/en.json')
  .then(en => {
    // add content after loading
    i18n.add('en', en)
  })
  .catch(e => console.error(e))
