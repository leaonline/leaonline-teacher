import { Template } from 'meteor/templating'
import './icon.html'

Template.icon.helpers({
  attributes () {
    const { data } = Template.instance()
    const atts = Object.create(data)

    // build class names from flags
    const fw = atts.fw ? 'fa-fw' : ''
    const pulse = atts.pulse ? 'fa-pulse' : ''
    const spinning = atts.spinning ? 'fa-spinning' : ''
    const actualClass = atts.class || ''
    const name = atts.name

    // rebuilding the class attribute
    // and delete the flag attributes
    atts.class = `fa fas ${fw} ${spinning} ${pulse} fa-${name} ${actualClass}`
    delete atts.fw
    delete atts.pulse
    delete atts.spinning

    return atts
  }
})
