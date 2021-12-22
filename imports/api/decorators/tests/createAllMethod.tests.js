/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { createAllMethod } from '../createAllMethod'
import { expect } from 'chai'
import { Random } from 'meteor/random'

describe(createAllMethod.name, function () {
  const localCollection = new Mongo.Collection(null)
  const context = {
    name: Random.id(8),
    collection: () => localCollection
  }

  afterEach(function () {
    localCollection.remove({})
  })

  it('returns a full method objecs', function () {
    const method = createAllMethod({ context })
    expect(method.name).to.deep.equal(`${context.name}.methods.all`)
    expect(method.schema).to.deep.equal({})
    expect(method.numRequests).to.deep.equal(1)
    expect(method.timeInterval).to.deep.equal(5000)
  })
  if (Meteor.isClient) {
    it('returns no function on the client', function () {
      const method = createAllMethod({ context })
      expect(method.run).to.equal(undefined)
    })
  }

  if (Meteor.isServer) {
    it('throws if no collection is found for this context', function () {
      const name = Random.id()
      const ctx = { name }
      const { run } = createAllMethod({ context: ctx })
      expect(() => run()).to.throw('errors.collectionUndefined')
      ctx.collection = () => undefined
      expect(() => run()).to.throw('errors.collectionUndefined')
    })
    it('defines a function that allows to a get all docs', function () {
      const docId = localCollection.insert({ title: Random.id() })
      const expectedDoc = localCollection.findOne(docId)

      const { run } = createAllMethod({ context })
      expect(run({})).deep.equal([expectedDoc])
    })
  }
})
