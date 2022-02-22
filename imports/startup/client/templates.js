import { Blaze } from 'meteor/blaze'
import { Template } from 'meteor/templating'
import { templateInit } from '../../ui/blaze/templateInit'
import { toLocaleDate } from '../../utils/toLocaleDate'

Blaze.TemplateInstance.prototype.init = templateInit

Template.registerHelper('toLocaleDate', toLocaleDate)

Template.registerHelper('gt', function (a, b) {
  return a > b
})

Template.registerHelper('truncate', function (num) {
  if (typeof num !== 'number') return 0
  return Math.trunc(num)
})
