import 'bootstrap'
import popper from 'popper.js'
import './scss/custom.scss'

global.Popper = global.Popper || popper // fixes some issues with Popper and Meteor
