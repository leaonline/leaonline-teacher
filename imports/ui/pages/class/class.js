import { Template } from 'meteor/templating'
import { State } from '../../../api/session/State'
import { classExists } from '../../utils/classExists'
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
