import { Dimension } from 'meteor/leaonline:corelib/contexts/Dimension'

// This app is stateless with the UnitSet content, which is why we define it
// only as local collection. The docs will get deleted after caches are emptied.
Dimension.isLocalCollection = true

export { Dimension }
