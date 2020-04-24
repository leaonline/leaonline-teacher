import { Template } from 'meteor/templating'
import { Session } from '../../../api/session/Session'
import { classExists } from '../../utils/classExists'
import './class.html'

Template.class.onCreated(function () {
  const instance = this
  instance.autorun(() => {
    const data = Template.currentData()
    const { classId } = data.params
    const currentClass = Session.currentClass()

    if (classExists() && currentClass !== classId) {
      Session.currentClass(classId)
    }

    if (Session.currentParticipant()) {
      Session.currentParticipant(null)
    }
  })
})
