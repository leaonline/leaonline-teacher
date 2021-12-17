/* eslint-env mocha */
import { Random } from 'meteor/random'
import { CollectionHooks } from '../CollectionHooks'
import { expect } from 'chai'

describe('CollectionHooks', function () {
  describe(CollectionHooks.beforeInsert.name, function () {
    it('transforms the insert doc', function () {
      const doc = { title: 'foo' }
      const userId = Random.id()

      CollectionHooks.beforeInsert(userId, doc)

      // type integrity
      expect(doc.meta.createdAt).to.be.instanceOf(Date)
      expect(doc.meta.updatedAt).to.be.instanceOf(Date)

      // structural integrity
      expect(doc).to.deep.equal({
        title: 'foo',
        meta: {
          createdAt: doc.meta.createdAt,
          createdBy: userId,
          updatedAt: doc.meta.updatedAt,
          updatedBy: userId
        }
      })
    })
  })
  describe(CollectionHooks.beforeUpdate.name, function () {
    it('transforms the update doc', function () {
      const userId = Random.id()
      const modifier = {
        $set: { title: 'foo' }
      }

      CollectionHooks.beforeUpdate(userId, modifier)

      expect(modifier.$set['meta.updatedAt']).to.be.instanceOf(Date)
      expect(modifier).to.deep.equal({
        $set: {
          title: 'foo',
          'meta.updatedAt': modifier.$set['meta.updatedAt'],
          'meta.updatedBy': userId
        }
      })
    })
  })
})
