import 'bootstrap'
import popper from '@popperjs/core'
import './scss/custom.scss'

global.Popper = global.Popper || popper // fixes some issues with Popper and Meteor
