/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { createUpdateMethod } from '../createUpdateMethod'
import { expect } from 'chai'
import { Random } from 'meteor/random'

describe(createUpdateMethod.name, function () {
  const localCollection = new Mongo.Collection(null)
  const context = {
    name: Random.id(8),
    collection: () => localCollection,
    schema: {
      title: String
    }
  }

  it('returns a full method objecs', function () {
    const method = createUpdateMethod({ context })
    expect(method.name).to.deep.equal(`${context.name}.methods.update`)
    expect(method.validate).to.be.a('function')
    expect(method.schema).to.equal(undefined)
    expect(method.timeInterval).to.equal(250)
    expect(method.numRequests).to.equal(1)
  })

  it('contains a validation for _id and modifier', function () {
    const { validate } = createUpdateMethod({ context })
    expect(() => validate({})).to.throw('schema.required')
    expect(() => validate({ _id: Random.id(), modifier: {} }))
      .to.throw('Expected \'modifier\' to be a modifier operator like \'$set\'')
    expect(() => validate({ _id: Random.id(), modifier: { $foo: { bar: 1 } } }))
      .to.throw('Expected \'modifier\' to be a modifier operator like \'$set\'')
    expect(() => validate({ _id: Random.id(), $set: { baz: { bar: 1 } } }))
      .to.throw('baz is not allowed by the schema')

    validate({ _id: Random.id(), $set: { title: 'bar' } })
  })

  if (Meteor.isClient) {
    it('returns no function on the client', function () {
      const method = createUpdateMethod({ context })
      expect(method.run).to.equal(undefined)
    })
  }

  if (Meteor.isServer) {
    it('defines a function that allows to update a given document', async () => {
      const insertDoc = { title: Random.id() }
      const docId = localCollection.insert(insertDoc)
      const { run } = createUpdateMethod({ context })
      const updated = await run.call({}, { _id: docId, $set: { title: 'moo' } })
      expect(updated).to.equal(1)

      const { meta, ...updatedDoc } = await localCollection.findOneAsync(docId)
      expect(updatedDoc).deep.equal({ _id: docId, title: 'moo' })
      expect(meta.updatedAt).to.be.instanceof(Date)
    })
  }
})
