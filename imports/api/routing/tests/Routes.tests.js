/* eslint-env mocha */
import { check, Match } from 'meteor/check'
import { Routes } from '../Routes'
import { i18n } from '../../i18n/I18n'
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

  allRoutes.forEach(key => {
    it(key, function () {
      const route = Routes[key]
      check(route, Match.ObjectIncluding({
        label: Match.OneOf(String, Function),
        template: String,
        target: Match.OneOf(null, String),
        load: Function
      }))

      if (route.parent) {
        assert.isTrue(!!Routes[route.parent.template])
      }

      const path = route.path()
      check(path, String)

      const triggersEnter = route.triggersEnter && route.triggersEnter()
      check(triggersEnter, [Function])
    })
  })
})
