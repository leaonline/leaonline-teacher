import { Template } from 'meteor/templating'
import { BlazeBootstrap } from '../../../api/blazebootstrap/BlazeBootstrap'
import { bbsComponentLoader } from '../../utils/bbsComponentLoader'
import './notFound.html'

const componentsLoader = bbsComponentLoader([
  BlazeBootstrap.link.load(),
  BlazeBootstrap.card.load(),
  BlazeBootstrap.jumbotron.load()
])
const componentsLoaded = componentsLoader.loaded

Template.notFound.helpers({
  componentsLoaded () {
    return componentsLoaded.get()
  }
})
