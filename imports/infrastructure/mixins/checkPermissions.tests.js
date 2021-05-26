/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { checkPermissions } from './checkPermissions'
import { stub, restoreAll } from '../../../tests/helpers.tests'

describe(checkPermissions.name, function () {
  afterEach(function () {
    restoreAll()
  })

  it('skips if isPublic flag is set', function () {
    const value = Random.id()
    const options = {
      isPublic: true,
      run: () => value
    }

    const updatedOptions = checkPermissions(options)
    expect(updatedOptions.run()).to.equal(value)
  })
  it('runs the function if there is a user', function () {
    let userCalled = false
    stub(Meteor, 'user', () => {
      userCalled = true
    })
    const value = Random.id()
    const options = {
      run: () => value
    }

    const updatedOptions = checkPermissions(options)
    expect(updatedOptions.run.call({ userId: Random.id() })).to.equal(value)
    expect(userCalled).to.equal(false)
  })
  it('falls back using Meteor.user in case', function () {
    let userCalled = false
    stub(Meteor, 'user', () => {
      userCalled = true
      return { _id: Random.id(), username: Random.id() }
    })
    const value = Random.id()
    const options = {
      run: () => value
    }

    const updatedOptions = checkPermissions(options)
    expect(updatedOptions.run()).to.equal(value)
    expect(userCalled).to.equal(true)
  })
  it('throws if there is no logged in user', function () {
    stub(Meteor, 'user', () => undefined)
    const options = {
      run: () => {
        throw new Error('unexpected call')
      }
    }

    const updatedOptions = checkPermissions(options)
    expect(() => updatedOptions.run()).to.throw('errors.userNotExists')
  })
  it('throws if the method is backend-flagged but the user is no backend-user', function () {
    const user = { _id: Random.id(), username: Random.id() }
    let userCalled = false
    let usersCalled = false
    stub(Meteor, 'user', () => {
      userCalled = true
      return user
    })
    stub(Meteor.users, 'findOne', () => {
      usersCalled = true
      return user
    })

    const value = Random.id()
    const options = {
      backend: true,
      run: () => value
    }

    const updatedOptions = checkPermissions(options)
    expect(() => updatedOptions.run()).to.throw('errors.backendOnly')
    expect(userCalled).to.equal(true)
    expect(usersCalled).to.equal(true)
  })
  it('passes if the method is backend-flagged and the user is a backend user', function () {
    const user = {
      _id: Random.id(),
      username: Random.id(),
      services: { lea: {} }
    }
    let userCalled = false
    let usersCalled = false
    stub(Meteor, 'user', () => {
      userCalled = true
      return user
    })
    stub(Meteor.users, 'findOne', () => {
      usersCalled = true
      return user
    })

    const value = Random.id()
    const options = {
      backend: true,
      run: () => value
    }

    const updatedOptions = checkPermissions(options)
    expect(updatedOptions.run()).to.equal(value)
    expect(userCalled).to.equal(true)
    expect(usersCalled).to.equal(true)
  })
})
