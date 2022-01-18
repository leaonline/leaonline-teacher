import { Template } from 'meteor/templating'
import { OtuLea } from '../../../api/remotes/OtuLea'
import { Course } from '../../../contexts/courses/Course'
import { User } from '../../../contexts/users/User'
import { State } from '../../../api/session/State'
import { Competency } from '../../../contexts/content/competency/Competency'
import { AlphaLevel } from '../../../contexts/content/alphalevel/AlphaLevel'
import { ColorType } from '../../../contexts/content/color/ColorType'
import { Dimension } from '../../../contexts/content/dimension/Dimension'
import { callMethod } from '../../../infrastructure/methods/callMethod'
import { getUserName } from '../../utils/getUserName'
import { loadDimensions } from '../../loaders/loadDimensions'
import { dataTarget } from '../../utils/dataTarget'
import classLanguage from './i18n/classLanguage'
import './visualization/visualization'
import './class.scss'
import './class.html'

Template.class.onCreated(function () {
  const instance = this
  instance.state.set('openCards', {})
  instance.state.set('openCategories', {})

  // reset current participant, in case we come from a participant page
  State.currentParticipant(null)

  instance.init({
    contexts: [Course, Dimension, Competency, AlphaLevel, User],
    useLanguage: [classLanguage],
    remotes: [OtuLea],
    debug: false,
    onComplete () {
      instance.state.set('initComplete', true)
    }
  })

  instance.autorun(() => {
    const data = Template.currentData()
    const { classId } = data.params

    callMethod({
      name: Course.methods.get,
      args: { _id: classId },
      prepare: () => instance.api.debug('load course doc'),
      failure: instance.api.notify,
      success: courseDoc => {
        instance.api.debug('course doc loaded')
        instance.state.set({
          courseDoc,
          title: courseDoc?.title
        })
      }
    })
  })

  // load all selectable dimensions

  instance.autorun(() => {
    const courseDoc = instance.state.get('courseDoc')
    if (!courseDoc) return

    if (!courseDoc.users?.length) {
      return instance.state.set('noUsers', true)
    }

    loadDimensions()
      .catch(instance.api.notify)
      .finally(() => instance.state.set('dimensionsLoaded', true))

    instance.api.debug('load users')

    callMethod({
      name: User.methods.get,
      args: { ids: courseDoc.users },
      failure: instance.api.notify,
      success: (users = []) => {
        if (courseDoc) {
          courseDoc.users = users
          State.currentClass(courseDoc)
        }
        instance.state.set({ users })
      }
    })
  })

  instance.autorun(() => {
    const dimensionDoc = instance.state.get('dimensionDoc')
    const courseDoc = instance.state.get('courseDoc')
    const userDocs = instance.state.get('users')

    if (!courseDoc || !dimensionDoc || !userDocs) { return }

    const dimension = dimensionDoc._id
    const users = userDocs.map(userDoc => userDoc.account._id)

    OtuLea.getRecords({ users, dimension })
      .then((records) => instance.state.set({ records }))
      .catch(instance.api.notify)
  })

  const byCreationDate = (a, b) => b.completedAt.getTime() - a.completedAt.getTime()

  instance.autorun(() => {
    const records = instance.state.get('records')
    const userDocs = instance.state.get('users')

    if (!userDocs?.length || !records?.length) { return }

    const userMap = new Map()
    userDocs.forEach(user => userMap.set(user.account._id, user))

    let id = 0
    const recordsByUser = new Map()
    const competencyCategories = new Map()
    const alphaLevels = new Map()
    const userDateCompetencyKeys = new Set()

    records.sort(byCreationDate).forEach(record => {
      console.debug(record.completedAt.toLocaleDateString(), record.userId)
      // first, check if there is no record yet
      // for the current user and create one for her
      if (!recordsByUser.has(record.userId)) {
        const user = userMap.get(record.userId)
        recordsByUser.set(record.userId, {
          _id: record.userId,
          name: getUserName(user),
          allDate: []
        })
      }

      // get the record and search all dates, if there is already a date
      // entry => this is because, maybe someone has tested a dimension
      // in multiple levels on the same day
      const userRecords = recordsByUser.get(record.userId)
      const existingDate = userRecords.allDate.find(d => d.date === record.completedAt.toLocaleDateString())

      // existing dates will be directly updated in the data-structure
      if (existingDate) {
        record.alphaLevels.forEach(entry => {
          const index = existingDate.level.length - entry.level
          existingDate.level[index].value = Math.round(entry.perc * 10)
          existingDate.level[index].alpha = entry.description
        })
      }

      // existing dates will create a new data-structure
      else {
        const levels = [
          {
            alpha: 'Alpha-Level 5',
            value: 0,
          },
          {
            alpha: 'Alpha-Level 4',
            value: 0,
          },
          {
            alpha: 'Alpha-Level 3',
            value: 0,
          },
          {
            alpha: 'Alpha-Level 2',
            value: 0,
          },
          {
            alpha: 'Alpha-Level 1',
            value: 0,
          },
        ]

        record.alphaLevels.forEach(entry => {
          if (!alphaLevels.has(entry._id)) {
            alphaLevels.set(entry._id, entry)
          }

          const index = levels.length - entry.level
          levels[index].value = Math.round(entry.perc * 10)
          levels[index].alpha = entry.description
        })

        userRecords.allDate.push({
          id: `graph${++id}`,
          date: record.completedAt.toLocaleDateString(),
          level: levels
        })
      }

      // additionally, process competencies for the list view
      record.competencies.forEach(competency => {
        const key = `${record.userId}-${competency._id}`

        if (userDateCompetencyKeys.has(key)) {
          console.debug('skip', key)
          return
        }
        else {
          userDateCompetencyKeys.add(key)
        }

        const categoryName = competency.category || 'undefined'

        // we group them by their categories so we need
        // a new entry for every new category, that occurs
        if (!competencyCategories.has(categoryName)) {
          competencyCategories.set(categoryName, {
            name: categoryName,
            entries: new Map(),
            users: 0,
            alphaAverage: 0
          })
        }

        const category = competencyCategories.get(categoryName)

        // the same applies for each new competency, that occurs
        if (!category.entries.has(competency._id)) {
          const alphaLevel = alphaLevels.get(competency.alphaLevel)

          category.entries.set(competency._id, {
            _id: competency._id,
            description: competency.description,
            shortCode: competency.shortCode,
            perc: 0,
            count: 0,
            average: 0,
            level: alphaLevel.level,
            users: new Map()
          })
        }

        // we need to sum up the perc values and create an average
        // because we want a representation of the whole class
        const entry = category.entries.get(competency._id)
        entry.count++
        entry.perc += competency.perc
        entry.average = (entry.perc / entry.count) * 100
        // console.debug(competency.shortCode, key, entry.count, entry.perc, entry.average)

        if (!entry.users.has(record.userId)) {
          const user = userMap.get(record.userId)
          entry.users.set(record.userId, {
            _id: user._id,
            name: getUserName(user),
            perc: 0,
            count: 0,
            average: 0
          })
        }

        const userDoc = entry.users.get(record.userId)
        userDoc.perc = competency.perc * 100

        if (entry.users.length > category.users) {
          category.users = entry.users.length
        }
      })
    })

    const results = Array
      .from(recordsByUser.values())
      .filter(doc => doc.allDate.length > 0)
    const hasFeedback = results.length > 0

    // finally make maps to arrays
    competencyCategories.forEach(category => {
      category.entries = Array
        .from(category.entries.values())
        .map(entry => {
          entry.users = Array.from(entry.users.values())
          return entry
        })
    })

    instance.state.set({
      results,
      hasFeedback,
      competencyCategories: Array.from(competencyCategories.values()),
      openCards: {}
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
    return Dimension.localCollection().find()
  },
  dimensionDoc () {
    return Template.getState('dimensionDoc')
  },
  color () {
    return Template.getState('color')
  },
  otuleaConnected () {
    return OtuLea.isConnected()
  },
  feedbackLoaded () {
    return Template.getState('feedbackLoaded')
  },
  hasFeedback () {
    return Template.getState('hasFeedback')
  },
  competencyDoc (id) {
    return Template.getState('competencyDocsLoaded') &&
      Competency.localCollection().findOne(id)
  },
  alphaLevelDoc (id) {
    return Template.getState('alphaLevelDocsLoaded') &&
      AlphaLevel.localCollection().findOne(id)
  },
  users () {
    return Template.getState('users')
  },
  courseDoc () {
    return Template.getState('courseDoc')
  },
  visualizationData () {
    const results = Template.getState('results')
    return results && { results }
  },
  noUsers () {
    return Template.getState('noUsers')
  },
  competencyCategories () {
    return Template.getState('competencyCategories')
  },
  openCard (category, competency) {
    const key = `${category}-${competency}`
    const openCards = Template.getState('openCards')
    console.debug(openCards[key])
    return openCards[key]
  },
  openCategory (category) {
    return category && Template.getState('openCategories')[category]
  }
})

Template.class.events({
  'change #dimension-select' (event, templateInstance) {
    event.preventDefault()

    const selectedDimension = templateInstance.$(event.currentTarget).val() || null
    const dimensionDoc = selectedDimension && Dimension.localCollection().findOne(selectedDimension)
    const color = selectedDimension && ColorType.byIndex(dimensionDoc.colorType)?.type

    templateInstance.state.set({ dimensionDoc, color })
  },
  'click .category-collapse' (event, templateInstance) {
    event.preventDefault()
    const category = dataTarget(event, 'category')
    const openCategories = templateInstance.state.get('openCategories')
    openCategories[category] = !openCategories[category]
    templateInstance.state.set({ openCategories })
  },
  'click .competency-entry' (event, templateInstance) {
    event.preventDefault()
    const category = dataTarget(event, 'category')
    const competency = dataTarget(event, 'competency')
    const key = `${category}-${competency}`
    const openCards = templateInstance.state.get('openCards')
    openCards[key] = !openCards[key]
    templateInstance.state.set({ openCards })
  }
})
