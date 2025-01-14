import { Meteor } from 'meteor/meteor'
import { onServer } from '../../utils/arch'
import { Schema } from '../schema/Schema'
import { CollectionHooks } from '../collections/CollectionHooks'

export const createUpdateMethod = ({ context, schema, timeInterval, numRequests, run }) => {
  const { name } = context
  const schemaDef = schema || typeof context.schema === 'function'
    ? context.schema()
    : context.schema
  const _idSchema = Schema.create({ _id: String })
  const modSchema = Schema.create(schemaDef)

  return {
    name: `${name}.methods.update`,
    validate (updateDoc) {
      const { _id, ...modifier } = updateDoc
      _idSchema.validate({ _id })
      modSchema.validate(modifier, { modifier: true })
    },
    numRequests: numRequests || 1,
    timeInterval: timeInterval || 250,
    run: onServer(run || async function (updateDoc) {
      const Collection = context.collection()
      if (!Collection) {
        throw new Meteor.Error('update.error', 'errors.collectionUndefined', { name })
      }

      const { _id, ...modifier } = updateDoc

      if (await Collection.countDocuments({ _id, 'meta.createdBy': this.userId }) < 1) {
        throw new Meteor.Error('update.error', 'errors.docNotFound', { name, _id })
      }

      CollectionHooks.beforeUpdate(this.userId, modifier)
      return Collection.updateAsync(_id, modifier)
    })
  }
}
