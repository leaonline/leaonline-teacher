import { onServer } from '../../utils/arch'
import { Schema } from '../schema/Schema'
import { CollectionHooks } from '../collections/CollectionHooks'

export const createUpdateMethod = ({ context, schema, timeInterval, numRequests, run, debug = () => {} }) => {
  const { name } = context
  const runFct = run || function (updateDoc) {
    const Collection = context.collection()
    if (!Collection) {
      throw new Meteor.Error('update.error', 'errors.collectionUndefined', { name })
    }

    const { _id, ...modifier } = updateDoc

    if (Collection.find({ _id, createdBy: this.userId }).count() < 1) {
      throw new Meteor.Error('update.error', 'errors.docNotFound', { name, _id })
    }

    CollectionHooks.beforeUpdate(this.userId, modifier)
    return Collection.update(_id, modifier)
  }
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
    run: onServer(runFct)
  }
}