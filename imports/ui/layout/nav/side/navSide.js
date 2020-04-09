import { Template } from 'meteor/templating'
import { BlazeBootstrap } from '../../../../api/blazebootstrap/BlazeBootstrap'
import { bbsComponentLoader } from '../../../utils/bbsComponentLoader'
import './navSide.html'
import './scss/navSlide.scss'

const componentsLoader = bbsComponentLoader([
  BlazeBootstrap.link.load()
])
const componentsLoaded = componentsLoader.loaded

Template.navSide.helpers({
  componentsLoaded () {
    return componentsLoaded.get()
  }
})

Template.navSide.events({
  'click .nav-item' (event) {
    console.log(event.currentTarget)
    $('.nav-item').css('background-color', '#646464')
    $(event.currentTarget).css('background-color', '#f59d1d')
  }
})
