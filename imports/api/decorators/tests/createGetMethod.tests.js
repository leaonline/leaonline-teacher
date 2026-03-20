/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { createGetMethod } from '../createGetMethod'
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { expectThrow } from '../../../../tests/testUtils.tests'

describe(createGetMethod.name, function () {
  const localCollection = new Mongo.Collection(null)
  const context = {
    name: Random.id(8),
    collection: () => localCollection
  }

  it('returns a full method objecs', function () {
    const method = createGetMethod({ context })
    expect(method.name).to.deep.equal(`${context.name}.methods.get`)
    expect(method.schema).to.deep.equal({
      _id: {
        type: String,
        optional: true
      },
      ids: {
        type: Array,
        optional: true
      },
      'ids.$': String
    })
  })
  if (Meteor.isClient) {
    it('returns no function on the client', function () {
      const method = createGetMethod({ context })
      expect(method.run).to.equal(undefined)
    })
  }

  if (Meteor.isServer) {
    it('throws if no collection is found for this context', async () => {
      const name = Random.id()
      const ctx = { name }
      const { run } = createGetMethod({ context: ctx })

      await expectThrow({
        fn: () => run(),
        message: 'errors.collectionUndefined'
      })
      ctx.collection = () => undefined
      await expectThrow({
        fn: () => run(),
        message: 'errors.collectionUndefined'
      })
    })
    it('defines a function that allows to a get a document by _id', async () => {
      const docId = localCollection.insert({ title: Random.id() })
      const expectedDoc = localCollection.findOne(docId)

      const { run } = createGetMethod({ context })
      expect(await run({ _id: Random.id() })).to.equal(undefined)
      expect(await run({ _id: docId })).deep.equal(expectedDoc)
    })
    it('defines a function that allows to a get multiple documents by ids', async () => {
      const docId = localCollection.insert({ title: Random.id() })
      const expectedDoc = localCollection.findOne(docId)

      const { run } = createGetMethod({ context })
      expect(await run({ ids: [Random.id()] })).to.deep.equal([])
      expect(await run({
        ids: [Random.id(), Random.id(), docId, Random.id(), Random.id()]
      })).deep.equal([expectedDoc])
    })
    it('returns undefined of both _id and ids are undefined', async () => {
      const { run } = createGetMethod({ context })
      expect(await run()).to.equal(undefined)
    })
  }
})
