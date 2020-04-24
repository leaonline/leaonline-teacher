import { Template } from 'meteor/templating'
import { Session } from '../../../api/session/Session'
import { classExists } from '../../utils/classExists'
import { userExists } from '../../utils/userExists'
import './user.html'

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
