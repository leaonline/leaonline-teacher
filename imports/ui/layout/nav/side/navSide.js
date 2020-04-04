import { Template } from 'meteor/templating'
import './navSide.html'
import { Routes } from '../../../../api/routing/Routes'
import { Router } from '../../../../api/routing/Router'

let currentElement = null
let currentPath = null

Template.navSide.helpers({
})

Template.navSide.events({
  'click .nav-link' (e) {
    // console.log(e.currentTarget.id)
    // currentElement = e.currentTarget.id
    // console.log(Router.go())
    // currentPath = Routes.class.load()
  }
})
