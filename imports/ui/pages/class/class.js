import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { OtuLea } from '../../../api/remotes/OtuLea'
import { Course } from '../../../contexts/courses/Course'
import { User } from '../../../contexts/users/User'
import { State } from '../../../api/session/State'
import { Competency } from '../../../contexts/content/competency/Competency'
import { AlphaLevel } from '../../../contexts/content/alphalevel/AlphaLevel'
import { ColorType } from '../../../contexts/content/color/ColorType'
import { Dimension } from '../../../contexts/content/dimension/Dimension'
import { CompetencyCategory } from '../../../contexts/content/competency/CompetencyCategory'
import { i18n } from '../../../api/i18n/I18n'
import classLanguage from './i18n/classLanguage'
import { callMethod } from '../../../infrastructure/methods/callMethod'
import { getAttendeeName } from '../../../api/accounts/getAttendeeName'
import { loadDimensions } from '../../loaders/loadDimensions'
import { dataTarget } from '../../utils/dataTarget'
import { loadCompetencyCategories } from '../../loaders/loadCompetencyCategories'
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
    contexts: [Course, Dimension, Competency, CompetencyCategory, AlphaLevel, User],
    useLanguage: [classLanguage],
    remotes: [OtuLea],
    debug: false,
    onComplete () {
      instance.state.set('initComplete', true)
    }
  })

  /**
   * Sets the dimension doc by given dimension id
   * @param dimensionId
   * @return {*}
   */
  instance.setDimension = dimensionId => {
    instance.api.debug('set dimension', dimensionId)
    State.currentDimension(dimensionId)

    const dimensionDoc = dimensionId && Dimension.localCollection().findOne(dimensionId)
    if (!dimensionDoc) {
      return console.warn('No doc found by dimension Id', dimensionId)
    }

    const color = dimensionId && ColorType.byIndex(dimensionDoc.colorType)?.type
    instance.state.set({ dimensionDoc, color })
  }

  instance.autorun(() => {
    const data = Template.currentData()
    const { classId } = data.params

    if (!Meteor.userId()) { return }

    callMethod({
      name: Course.methods.get,
      args: { _id: classId },
      prepare: () => instance.api.debug('load course doc'),
      failure: error => {
        instance.api.debug('error at', Course.methods.get.name)
        instance.api.notify(error)
      },
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
    if (!courseDoc || !Meteor.userId()) return

    loadDimensions()
      .catch(error => {
        instance.api.debug('error at load dimensions')
        instance.api.notify(error)
      })
      .then(dimensionDocs => {
        // if not already set by query param we load the first dimension
        if (!instance.state.get('dimensionDoc')) {
          instance.state.set({ dimensionDoc: dimensionDocs[0] })
        }
      })
      .finally(() => instance.state.set('dimensionsLoaded', true))

    if (!courseDoc.users?.length) {
      return instance.state.set({ users: [], hasUsers: false })
    }

    instance.api.debug('load users')

    callMethod({
      name: User.methods.get,
      args: { ids: courseDoc.users },
      failure: error => {
        instance.api.debug('error at', User.methods.get.name)
        instance.api.notify(error)
      },
      success: (users = []) => {
        if (courseDoc) {
          courseDoc.users = users
          State.currentClass(courseDoc)
        }

        const hasUsers = !!(users?.length)
        instance.state.set({ users, hasUsers })
      }
    })
  })

  // load records

  instance.autorun(() => {
    const dimensionDoc = instance.state.get('dimensionDoc')
    const courseDoc = instance.state.get('courseDoc')
    const userDocs = instance.state.get('users')
    const hasUsers = instance.state.get('hasUsers')

    if (!courseDoc || !dimensionDoc || !userDocs || !hasUsers || !Meteor.userId() || !OtuLea.isLoggedIn()) {
      return
    }

    instance.api.debug('load records')

    // we prepare to load all relevant records for this dimension
    // for all users of the class but only if they have an associated
    // user account with _id value

    const dimension = dimensionDoc._id
    const users = []

    userDocs.forEach(userDoc => {
      if (userDoc?.account?._id) {
        users.push(userDoc.account._id)
      }
    })

    OtuLea.getRecords({ users, dimension })
      .then((records = []) => instance.state.set({
        records,
        hasRecords: records.length > 0
      }))
      .catch(error => {
        instance.api.debug('error at OtuLea.getRecords')
        instance.api.notify(error)
      })
  })

  instance.autorun(() => {
    const records = instance.state.get('records')
    const userDocs = instance.state.get('users')

    if (!Meteor.userId()) { return }

    instance.state.set({
      results: null,
      hasFeedback: null,
      loadRecords: false,
      competencyCategories: null,
      openCards: null
    })

    if (!userDocs?.length || !records?.length) { return }

    instance.api.debug('process records')
    instance.state.set({ loadRecords: true })

    // convert users array to map

    const userMap = new Map()
    userDocs.forEach(user => {
      if (user?.account?._id) {
        userMap.set(user.account._id, user)
      }
    })

    let id = 0
    const recordsByUser = new Map()
    const competencyCategories = new Map()
    const alphaLevels = new Map()
    const userDateCompetencyKeys = new Set()

    // ---------------------------------------------
    // SECTION A - Process and denormalize results
    // ---------------------------------------------

    instance.api.debug('denormalize records')
    records.forEach(record => {
      // first, check if there is no record yet
      // for the current user and create one for her
      if (!recordsByUser.has(record.userId)) {
        const user = userMap.get(record.userId)

        recordsByUser.set(record.userId, {
          _id: record.userId,
          name: getAttendeeName(user),
          allDate: []
        })
      }

      // get the record and search all dates, if there is already a date
      // entry => this is because, maybe someone has tested a dimension
      // in multiple levels on the same day
      const userRecords = recordsByUser.get(record.userId)
      const searchDate = record.completedAt.toLocaleDateString()
      const existingDate = userRecords.allDate.find(d => d.date === searchDate)
      instance.api.debug('find entry for date:', searchDate, '=>', existingDate)

      // ---------------------------------------------
      // PART 1 - Alpha Levels
      // ---------------------------------------------
      // ---------------------------------------------
      const alphaLabel = i18n.get('alphaLevel.title')

      // case: user has already entry for this date
      // then: existing dates will be directly updated in the data-structure
      if (existingDate) {
        record.alphaLevels.forEach(alphaLevel => {
          instance.api.debug('alpha level', alphaLevel?.level)
          const index = existingDate.level.length - alphaLevel.level
          existingDate.level[index].value = Math.round(alphaLevel.perc * 100)
          existingDate.level[index].alpha = `${alphaLabel} ${index + 1}`
          existingDate.level[index].title = alphaLevel.title
          existingDate.level[index].description = alphaLevel.description
        })
      }

      // case: user has no entry for this date
      // then: new dates will create a new data-structure
      else {
        const levels = Array.of(5, 4, 3, 2, 1).map(index => ({
          alpha: `${alphaLabel} ${index}`,
          value: 0
        }))

        record.alphaLevels.forEach(alphaLevel => {
          if (!alphaLevels.has(alphaLevel._id)) {
            alphaLevels.set(alphaLevel._id, alphaLevel)
          }

          instance.api.debug('alpha level', alphaLevel?.level)
          const value = Math.round(alphaLevel.perc * 100)
          const index = levels.length - alphaLevel.level
          levels[index].value = value
          levels[index].title = alphaLevel.title
          levels[index].description = alphaLevel.description
        })

        userRecords.allDate.push({
          id: `graph${++id}`,
          date: record.completedAt,
          level: levels
        })
      }

      // ---------------------------------------------
      // PART 2 - Competencies
      // ---------------------------------------------

      // additionally, process competencies for the list view
      record.competencies.forEach(competency => {
        const key = `${record.userId}-${competency._id}`

        if (userDateCompetencyKeys.has(key)) {
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

          if (!alphaLevel) {
            return console.warn('Found no alphalevel by _id that was linked by competency', { competency })
          }

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

        if (!entry.users.has(record.userId)) {
          const user = userMap.get(record.userId)
          entry.users.set(record.userId, {
            _id: user._id,
            name: getAttendeeName(user),
            code: user?.account?.code,
            perc: 0,
            count: 0,
            average: 0
          })
        }

        const userDoc = entry.users.get(record.userId)
        userDoc.perc = competency.perc * 100

        if (entry.users.size > category.users) {
          category.users = entry.users.size
        }
      })
    })

    // ---------------------------------------------
    // SECTION B - Prepare for rendering
    // ---------------------------------------------

    instance.api.debug('prepare records for rendering')
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

    const categoryIds = [...competencyCategories.keys()]

    if (categoryIds.length > 0) {
      loadCompetencyCategories(categoryIds)
        .catch(e => instance.api.notify(e))
        .then(() => {
          const categories = (instance.state.get('competencyCategories') || []).map(cat => {
            const catDoc = CompetencyCategory.localCollection().findOne(cat.name)

            if (cat.name === 'undefined') {
              cat.label = i18n.get('competency.categories.all')
            }

            if (!catDoc) return cat

            cat.label = catDoc.title || cat.name
            return cat
          })

          instance.state.set({
            loadRecords: false,
            competencyCategories: categories.sort((a, b) => a.label.localeCompare(b.label))
          })
        })
    }

    instance.state.set({
      visualizationData: { entries: results },
      hasFeedback,
      loadRecords: false,
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
  alphaLevels () {
    return Template.getState('alphaLevels')
  },
  users () {
    return Template.getState('users')
  },
  courseDoc () {
    return Template.getState('courseDoc')
  },
  visualizationData () {
    // if we are loading we need to return null here in order to
    // wipe the DOM, which allows us to switch beteween dimensions
    // easily without having multiple instances on the screen
    if (Template.getState('loadRecords')) {
      return null
    }

    return Template.getState('visualizationData')
  },
  noUsers () {
    return Template.getState('users') && !Template.getState('hasUsers')
  },
  competencyCategories () {
    return Template.getState('competencyCategories')
  },
  openCard (category, competency) {
    const key = `${category}-${competency}`
    const openCards = Template.getState('openCards')
    return openCards[key]
  },
  openCategory (category) {
    return category && Template.getState('openCategories')[category]
  },
  loadRecords () {
    return Template.getState('loadRecords')
  },
  hasRecords () {
    return Template.getState('hasRecords')
  }
})

Template.class.events({
  'change #dimension-select' (event, templateInstance) {
    event.preventDefault()

    const selectedDimension = templateInstance.$(event.currentTarget).val() || null
    templateInstance.setDimension(selectedDimension)
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
