import { Blaze } from 'meteor/blaze'
import { Template } from 'meteor/templating'
import { templateInit } from '../../ui/blaze/templateInit'

Blaze.TemplateInstance.prototype.init = templateInit

Template.registerHelper('toLocaleDate', function (date) {
  if (!date instanceof Date) return date
  // TODO load user locale string
  return date.toLocaleString()
})