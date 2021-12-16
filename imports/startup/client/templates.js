import { Blaze } from 'meteor/blaze'
import { Template } from 'meteor/templating'
import { templateInit } from '../../ui/blaze/templateInit'

Blaze.TemplateInstance.prototype.init = templateInit

Template.registerHelper('toLocaleDate', function (date, type = 'both') {
  if (!date instanceof Date) return date
  // TODO load user locale string
  switch(type) {
    case 'time':
      return date.toLocaleTimeString()
    case 'date':
      return date.toLocaleDateString()
    case 'both':
      return date.toLocaleString()
    default:
      throw new Error(`Type not supported: ${type}`)
  }
})