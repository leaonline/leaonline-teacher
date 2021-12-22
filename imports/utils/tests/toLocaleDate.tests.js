/* eslint-env mocha */
import { expect } from 'chai'
import { toLocaleDate } from '../toLocaleDate'

describe(toLocaleDate.name, function () {
  it('transforms a date to locale date string', function () {
    const date = new Date()
    const str = toLocaleDate(date)
    expect(str).to.equal(date.toLocaleString())

    expect(toLocaleDate(date, {})).to.equal(date.toLocaleString())
    expect(toLocaleDate(date, 'both')).to.equal(date.toLocaleString())
    expect(toLocaleDate(date, 'date')).to.equal(date.toLocaleDateString())
    expect(toLocaleDate(date, 'time')).to.equal(date.toLocaleTimeString())
  })
})
