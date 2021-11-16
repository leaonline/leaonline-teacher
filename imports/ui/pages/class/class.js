import { Template } from 'meteor/templating'
import { State } from '../../../api/session/State'
import { Course } from '../../../contexts/courses/Course'
import { ColorType } from '../../../contexts/content/color/ColorType'
import { OtuLea } from '../../../startup/client/remote'
import { Dimension } from '../../../contexts/content/dimension/Dimension'
import classLanguage from './i18n/classLanguage'
import { callMethod } from '../../../infrastructure/methods/callMethod'
import './class.html'

Template.class.onCreated(function () {
  const instance = this

  instance.init({
    contexts: [Course, Dimension],
    useLanguage: [classLanguage],
    debug: true,
    onComplete () {
      instance.state.set('initComplete', true)
    }
  })

  instance.autorun(() => {
    const data = Template.currentData()
    const { classId } = data.params
    const currentClass = State.currentClass()

    if (currentClass !== classId) {
      State.currentClass(classId)
    }

    if (State.currentParticipant()) {
      State.currentParticipant(null)
    }

    callMethod({
      name: Course.methods.get,
      args: { _id: classId },
      prepare: () => instance.api.debug('load course doc'),
      failure: error => console.error(error),
      success: courseDoc => {
        instance.api.debug('course doc loaded')
        instance.state.set({
          courseDoc,
          title: courseDoc.title
        })
      }
    })
  })

  instance.autorun(() => {
    const courseDoc = instance.state.get('courseDoc')
    if (!courseDoc) return

    instance.api.debug('load dimensions')

    /*
    TODO: callMethod -> Dimension.methods.get
    ContentServer.loadAllContentDocs(Dimension, {}, instance.api.debug)
      .then(dimensionDocs => {
        instance.api.debug('dimensions loaded', { dimensionDocs })
        instance.state.set('dimensionsLoaded', dimensionDocs.length > 0)
      })
      .catch(e => console.error(e))
     */
  })

  instance.autorun(() => {
    const dimensionDoc = instance.state.get('dimensionDoc')
    const courseDoc = instance.state.get('courseDoc')
    if (!courseDoc || !dimensionDoc) return

    const users = courseDoc.users.map(u => u._id)
    OtuLea.call({
      name: 'session.methods.getForUsers', // TODO define in settings
      args: { users },
      failure: e => console.error(e),
      success: ({ session }) => {
        console.debug(session)
      }
    })
  })
})

Template.class.helpers({
  loadComplete () {
    return Template.getState('initComplete') && Template.getState('dimensionsLoaded')
  },
  title () {
    return Template.getState('title')
  },
  dimensions () {
    return Dimension.collection().find()
  },
  dimensionDoc () {
    return Template.getState('dimensionDoc')
  },
  color () {
    return Template.getState('color')
  }
})

Template.class.events({
  'change #dimension-select' (event, templateInstance) {
    event.preventDefault()

    const selectedDimension = templateInstance.$(event.currentTarget).val() || null
    const dimensionDoc = Dimension.collection().findOne(selectedDimension)
    const color = ColorType.byIndex(dimensionDoc.colorType)?.type

    templateInstance.state.set({ dimensionDoc, color })
  }
})
