import { Dimension } from 'meteor/leaonline:corelib/contexts/Dimension'
import { createAllMethod } from '../../../api/decorators/createAllMethod'

// This app is stateless with the UnitSet content, which is why we define it
// only as local collection. The docs will get deleted after caches are emptied.
Dimension.isLocalCollection = false

Dimension.methods = Dimension.methods || {}

Dimension.methods.all = createAllMethod({ context: Dimension })

export { Dimension }
