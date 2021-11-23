/**//* eslint-env mocha */
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
    expect(() => validate({})).to.throw('ID is required')
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
})
