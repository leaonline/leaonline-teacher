import { AlphaLevel } from 'meteor/leaonline:corelib/contexts/AlphaLevel'
import { createGetMethod } from '../../../api/decorators/createGetMethod'

AlphaLevel.methods = AlphaLevel.methods || {}

AlphaLevel.methods.get = createGetMethod({ context: AlphaLevel })

export { AlphaLevel }
