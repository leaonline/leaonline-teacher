import { Template } from 'meteor/templating'
import { Session } from '../../../api/session/Session'
import { classExists } from '../../utils/classExists'
import { userExists } from '../../utils/userExists'
import { CompetencyCategories } from '../../../api/collections/competencyCategories'
// import { Schema } from '../../../api/schema/Schema'
import './user.html'
import { bbsComponentLoader } from '../../utils/bbsComponentLoader'
import { BlazeBootstrap } from '../../../api/blazebootstrap/BlazeBootstrap'

Template.user.onCreated(function () {
  const instance = this
  instance.autorun(() => {
    const data = Template.currentData()
    const { classId } = data.params
    const currentClass = Session.currentClass()

    if (classExists(classId) && currentClass !== classId) {
      Session.currentClass(classId)
    }

    const { userId } = data.params
    const currentUser = Session.currentParticipant()

    if (userExists(userId) && currentUser !== userId) {
      Session.currentParticipant(userId)
    }
  })
})

const componentsLoader = bbsComponentLoader([
  BlazeBootstrap.link.load(),
  BlazeBootstrap.button.load(),
  BlazeBootstrap.listgroup.load(),
  BlazeBootstrap.item.load(),
  BlazeBootstrap.card.load(),
  BlazeBootstrap.badge.load(),
  BlazeBootstrap.modal.load()
])

const componentsLoaded = componentsLoader.loaded
// const competencyCategoriesSchema = Schema.create(CompetencyCategories.schema)
// const collection = CompetencyCategories.collection()

Template.user.helpers({
  componentsLoaded () {
    return componentsLoaded.get()
  },
  competencyCategories () {
    const cursor = CompetencyCategories.collection().find()
    console.log(cursor.fetch())
    if (cursor.count() === 0) return null
    return cursor
  }
})
