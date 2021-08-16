import { createMethodFactory } from 'meteor/leaonline:method-factory'
import { environmentExtensionMixin } from '../../mixins/environmentExtensionMixin'
import { checkPermissions } from '../../mixins/checkPermissions'
import { Schema } from '../../../api/schema/Schema'

export const createMethod = createMethodFactory({
  schemaFactory: Schema.create,
  mixins: [environmentExtensionMixin, checkPermissions]
})

export const createMethods = methods => methods.forEach(methodDef => {
  console.info(`[methodFactory]: create ${methodDef.name}`)
  createMethod(methodDef)
})
