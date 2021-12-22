/* eslint-env mocha */
import { contentBuilder } from '../contentBuilder'
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { Mongo } from 'meteor/mongo'

describe(contentBuilder.name, function () {
  it('applies the full factory-pipeline to a context', function () {
    const name = Random.id(6)
    const ctx = {
      name: name,
      label: `${name}.title`,
      icon: 'check',
      schema: {
        title: String
      }
    }

    contentBuilder(ctx)
    const collection = Mongo.Collection.get(name)
    expect(collection).to.be.instanceOf(Mongo.Collection)
    expect(ctx.collection()).to.equal(collection)
    expect(ctx.methods).to.be.a('object')
    expect(ctx.publications).to.be.a('object')
  })
})
