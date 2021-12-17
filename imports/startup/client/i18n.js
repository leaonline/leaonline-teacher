import { i18n } from '../../api/i18n/I18n'
import defaultRoutes from '../../../resources/i18n/de/routes'

const config = {
  settings: { // --> Config object
    defaultLocale: 'de',
    en: {
      code: 'de',
      isoCode: 'de-DE',
      name: 'Deutsch'
    }
  },
  de: defaultRoutes
}

i18n.load(config)

// load base translation
import('../../../resources/i18n/de/de.json')
  .then(de => {
    // add content after loading
    i18n.add('de', de)
  })
  .catch(e => console.error(e))
