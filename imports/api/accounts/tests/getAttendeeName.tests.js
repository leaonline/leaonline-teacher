/* eslint-env mocha */
import { expect } from 'chai'
import { getAttendeeName } from '../getAttendeeName'

describe(getAttendeeName.name, function () {
  it('returns undefined if neither names nor code are defined', function () {
    expect(getAttendeeName({})).to.equal(undefined)
  })
  it('returns the code if no names are defined', function () {
    const user = { account: { code: 'foo' } }
    expect(getAttendeeName(user)).to.equal('foo')
  })
  it('returns the attendee\'s full name, if defined', function () {
    const user = {
      account: { code: 'foo' },
      firstName: 'john',
      lastName: 'doe'
    }
    expect(getAttendeeName(user)).to.equal('john doe')
  })
  it('returns the attendee\'s partial name, if defined', function () {
    expect(getAttendeeName({ firstName: 'john' })).to.equal('john')
    expect(getAttendeeName({ lastName: 'doe' })).to.equal('doe')
  })
  it('optionally attaches the code if set to true', function () {
    const user = {
      account: { code: 'foo' },
      firstName: 'john',
      lastName: 'doe'
    }
    expect(getAttendeeName(user, { alwaysIncludeCode: true })).to.equal('john doe - foo')
  })
})
