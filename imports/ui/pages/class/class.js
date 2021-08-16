/* global $ */
import { Template } from 'meteor/templating'
import { State } from '../../../api/session/State'
import { classExists } from '../../utils/classExists'
import visualizationData from './data/visualization'
import competenciesData from './data/competencies'
import './class.html'

Template.class.onCreated(function () {
  const instance = this
  instance.autorun(() => {
    const data = Template.currentData()
    const { classId } = data.params
    const currentClass = State.currentClass()

    if (classExists() && currentClass !== classId) {
      State.currentClass(classId)
    }

    if (State.currentParticipant()) {
      State.currentParticipant(null)
    }
  })
})

// use this hook to inject dynamic html or canvas usage or whatever after
// the template has been created and it's DOM tree has been rendered at least
// once
// you can either use jQuery or standard DOM methods
// please don't forget to remove this example code
Template.class.onRendered(function () {
  // method a: jQuery
  const $target = $('#visualization-target')
  $target.html(`<pre><code>${JSON.stringify(visualizationData[0], null, 2)}</code></pre>`)

  // method b: standards
  const canvas = document.querySelector('#visualization-canvas')
  const context = canvas.getContext('2d')
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = 70
  const eyeRadius = 10
  const eyeXOffset = 25

  // draw the yellow circle
  context.beginPath()
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false)
  context.fillStyle = 'yellow'
  context.fill()
  context.lineWidth = 5
  context.strokeStyle = 'black'
  context.stroke()

  // draw the eyes
  context.beginPath()
  let eyeX = centerX - eyeXOffset
  const eyeY = centerY - eyeXOffset
  context.arc(eyeX, eyeY, eyeRadius, 0, 2 * Math.PI, false)
  eyeX = centerX + eyeXOffset
  context.arc(eyeX, eyeY, eyeRadius, 0, 2 * Math.PI, false)
  context.fillStyle = 'black'
  context.fill()

  // draw the mouth
  context.beginPath()
  context.arc(centerX, centerY, 50, 0, Math.PI, false)
  context.stroke()

  // method c: use a 3rd party library, don't forget to import it
  // Plotly.newPlot('visualization-target', visualizationData)
})

Template.class.helpers({
  classCompetencies () {
    return competenciesData
  }
})
