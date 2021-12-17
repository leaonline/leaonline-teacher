import { isomorphic } from '../imports/utils/arch'

import '../imports/api/accounts/tests'
import '../imports/api/decorators/tests'
import '../imports/utils/tests'

isomorphic({
  server: function () {
    import '../imports/api/build/tests'
    import '../imports/api/collections/tests'
  },

  client: function () {
    import '../imports/api/routing/tests'
  }
})
