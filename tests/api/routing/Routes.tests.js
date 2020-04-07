/* eslint-env mocha */
import { check, Match } from 'meteor/check'
import { Routes } from '../../../imports/api/routing/Routes'
import { i18n } from '../../../imports/api/i18n/I18n'
import { assert } from 'chai'
import sinon from 'sinon'

const allRoutes = Object.keys(Routes)

describe('Routes', function () {
  beforeEach(function () {
    sinon.stub(i18n, 'get').callsFake(x => x)
  })

  afterEach(function () {
    i18n.get.restore()
  })

  describe('properties', function () {
    it('path', function () {
      allRoutes.forEach(key => {
        const route = Routes[key]
        const path = route.path()
        check(path, String)
      })
    })

    it('label', function () {
      allRoutes.forEach(key => {
        const route = Routes[key]
        check(route.label, String)
      })
    })

    it('triggersEnter', function () {
      allRoutes.forEach(key => {
        const route = Routes[key]
        const triggersEnter = route.triggersEnter && route.triggersEnter()
        check(triggersEnter, [Function])
      })
    })

    it('load', function () {
      allRoutes.forEach(key => {
        const route = Routes[key]
        const promise = route.load()
        promise.catch(() => {})
        assert.equal(promise.constructor.name, 'Promise')
      })
    })

    it('target', function () {
      allRoutes.forEach(key => {
        const route = Routes[key]
        check(route.target, Match.Maybe(String))
      })
    })

    it('template', function () {
      allRoutes.forEach(key => {
        const route = Routes[key]
        check(route.template, String)
      })
    })

    it('parent', function () {
      allRoutes.forEach(key => {
        const route = Routes[key]
        check(route.parent, Match.Maybe(Object))
        if (route.parent) {
          assert.isTrue(!!Routes[route.parent.template])
        }
      })
    })

    it('data', function () {
      allRoutes.forEach(key => {
        const route = Routes[key]
        check(route.target, Match.Maybe(String))
      })
    })
  })
})
