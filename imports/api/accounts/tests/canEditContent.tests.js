/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { canEditContent } from '../canEditContent'
import { expect } from 'chai'

const contentRole = Meteor.settings.public.hosts.content.role

describe(canEditContent.name, function () {
  it('determines, if a user can edit content', function () {
    const user = {
      services: {
        lea: {
          roles: [contentRole]
        }
      }
    }
    expect(canEditContent({})).to.equal(false)
    expect(canEditContent(user)).to.equal(true)
    user.services.lea.roles.push('foo')
    expect(canEditContent(user)).to.equal(true)

    user.services.lea.roles = ['foo']
    expect(canEditContent(user)).to.equal(false)
  })
})
