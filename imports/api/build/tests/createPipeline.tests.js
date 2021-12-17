/* eslint-env mocha */
import { expect } from 'chai'
import { createPipeline } from '../createPipeline'

describe(createPipeline.name, function () {
  it('returns a function that applies all fns to a context', function () {
    const ctx = { name: 'foo' }
    const functions = [
      x => {
        x.name = 'bar'
      },
      x => {
        x.methods = {}
      },
      x => {
        x.methods.biz = 'baz'
      }
    ]
    const pipeline = createPipeline({ functions })
    pipeline(ctx)

    expect(ctx).to.deep.equal({
      name: 'bar',
      methods: {
        biz: 'baz'
      }
    })
  })
})
