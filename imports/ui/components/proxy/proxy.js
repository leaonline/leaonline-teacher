import { Template } from 'meteor/templating'
import './proxy.html'

Template.proxy.helpers({
  templateData () {
    const { data } = Template.instance()
    delete data.template
    delete data.loaded
    return data
  }
})
