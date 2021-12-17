/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { createInsertMethod } from '../createInsertMethod'
import { expect } from 'chai'
import { stub, restoreAll } from '../../../../tests/teacherStubs'
import { Random } from 'meteor/random'
import { CollectionHooks } from '../../collections/CollectionHooks'

describe(createInsertMethod.name, function () {
  const localCollection = new Mongo.Collection(null)
  const context = {
    name: Random.id(8),
    schema: {
      title: String
    },
    collection: () => localCollection
  }

  afterEach(function () {
    localCollection.remove({})
    restoreAll()
  })

  it('returns a full method objecs', function () {
    const method = createInsertMethod({ context })
    expect(method.name).to.deep.equal(`${context.name}.methods.insert`)
    expect(method.schema).to.deep.equal({ title: String })
  })
  it('allows to add additional mixins', function () {
    const method = createInsertMethod({ context, foo: 'bar' })
    expect(method.foo).to.equal('bar')
  })
  if (Meteor.isClient) {
    it('returns no function on the client', function () {
      const method = createInsertMethod({ context })
      expect(method.run).to.equal(undefined)
    })
  }

  if (Meteor.isServer) {
    it('throws if no collection is found for this context', function () {
      const name = Random.id()
      const ctx = { name }
      const { run } = createInsertMethod({ context: ctx })
      expect(() => run()).to.throw('errors.collectionUndefined')
      ctx.collection = () => undefined
      expect(() => run()).to.throw('errors.collectionUndefined')
    })
    it('defines a function that allows to a get all docs', function () {
      const insertDoc = { title: Random.id() }
      stub(CollectionHooks, 'beforeInsert', () => {})
      const { run } = createInsertMethod({ context })
      const docId = run(insertDoc)
      const loadedDoc = localCollection.findOne(docId)
      expect(loadedDoc).deep.equal({
        _id: docId,
        title: insertDoc.title
      })
    })
  }
})
