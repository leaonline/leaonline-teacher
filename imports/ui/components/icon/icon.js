import { Tracker } from 'meteor/tracker'
import { Template } from 'meteor/templating'
import './icon.html'

Template.icon.onCreated(function () {
  const instance = this

  instance.autorun(() => {
    console.debug('autorun')
    const data = Template.currentData()
    const atts = { ...data }

    // build class names from flags
    const fw = atts.fw ? 'fa-fw' : ''
    const pulse = atts.pulse ? 'fa-pulse' : ''
    const spinning = atts.spinning ? 'fa-spinning' : ''
    const actualClass = atts.class || ''
    const name = atts.name
    const colorClass = atts.color ? `text-${atts.color}` : ''

    // rebuilding the class attribute
    // and delete the flag attributes
    atts.class = `fa fas ${fw} ${spinning} ${pulse} fa-${name} ${actualClass} ${colorClass}`

    const current = Tracker.nonreactive(() => instance.state.get('atts')) || {}
    if (current.class !== atts.class) {
      console.warn('mismatch')
      console.debug(atts.class)
      console.debug(current.class)
    }

    delete atts.fw
    delete atts.color
    delete atts.pulse
    delete atts.spinning

    instance.state.set({ atts })
  })
})

Template.icon.helpers({
  attributes () {
    return Template.getState('atts')
  }
})
