import { Template } from 'meteor/templating'
import { Course } from '../../../contexts/courses/Course'
import { User } from '../../../contexts/users/User'
import { OtuLea } from '../../../api/remotes/OtuLea'
import { State } from '../../../api/session/State'
import { i18n } from '../../../api/i18n/I18n'
import { AlphaLevel } from '../../../contexts/content/alphalevel/AlphaLevel'
import { CompetencyCategory } from '../../../contexts/content/competency/CompetencyCategory'
import { Competency } from '../../../contexts/content/competency/Competency'
import { Dimension } from '../../../contexts/content/dimension/Dimension'
import { callMethod } from '../../../infrastructure/methods/callMethod'
import { loadDimensions } from '../../loaders/loadDimensions'
import { ColorType } from '../../../contexts/content/color/ColorType'
import { getCompetencyIcon } from '../../utils/competency/getCompetencyIcon'
import userLanguage from './i18n/userLanguage'
import { translationStringFactory } from '../../../api/i18n/translationStringFactory'
import './user.scss'
import './user.html'
import { dataTarget } from '../../utils/dataTarget'

const toCompetencyTranslation = translationStringFactory('competency')

Template.user.onCreated(function () {
  const instance = this
  instance.state.set('filters', [])
  instance.state.set('flipped', {})

  instance.init({
    contexts: [Course, Competency, CompetencyCategory, Dimension, AlphaLevel, User],
    remotes: [OtuLea],
    useLanguage: [userLanguage],
    onComplete () {
      loadDimensions().catch(instance.api.notify)
      instance.state.set('initComplete', true)
    }
  })

  instance.resetFilter = () => {
    instance.state.set('filters', [])
  }

  instance.applyFilters = () => {
    const filters = instance.state.get('filters')
    const hasKey =  typeof key === 'string'
    const competencyCategories = instance.state.get('competencyCategories')
    competencyCategories.forEach(category => {
      category.entries.forEach(competency => {
        const disabled = filters.some(({ target, hasKey, key, value }) => {
          if (!competency[target]) return false

          const prop = hasKey
            ? competency[target][key]
            : competency[target]

          return prop == value // eslint-disable-line
        })

        competency.isActive = !disabled
      })
    })

    instance.state.set({ competencyCategories })
  }

  /**
   * Filter api to remove competencies from display, based on different filter
   * targets (alphaLevel, development, gradeName)
   *
   * @param target {string} name of the target property on a competency
   * @param key {string} optional key, if the target is an object
   * @param value {string} the value to compare
   * @param active {boolean} the active state to set on that competency
   */
  instance.setFilter = ({ target, key, value, active }) => {
    const filters = instance.state.get('filters')
    const index = filters.findIndex(entry =>
      entry.target === target &&
      entry.key === key &&
      entry.value === value)

    // if disabled and no entry found: add filter to the list
    if (index === -1 && !active) {
      const hasKey = typeof key === 'string'
      filters.push({ target, key, value, hasKey })
    }

    // if already disabled but not again active: remove from list
    if (index > -1 && active) {
      filters.splice(index, 1)
    }

    instance.state.set({ filters })
  }

  instance.autorun(() => {
    const data = Template.currentData()
    const { userId } = data.params
    State.currentParticipant(userId)

    // if we selected the participant from the course/class then we
    // should update the sidebarState
    const classId = data.queryParams.class || null
    const currentClass = State.currentClass()
    if (currentClass && classId !== currentClass._id) {
      // fetch class and update in case we have no classDoc available
    }

    // if we selected a specific session
    // then we need the id for further filtering
    const sessionId = data.queryParams.session || null

    callMethod({
      name: User.methods.get,
      args: { _id: userId },
      failure: instance.api.notify,
      success (userDoc) {
        State.currentParticipant(userDoc)
        instance.state.set({ userDoc, sessionId })
      }
    })
  })

  // for gathering the data we create a two-step process:
  // 1. get all sessions by dimension and provide a select component
  // 2. load the feedback doc(s) for the selected session or all sessions

  instance.autorun(() => {
    const userDoc = instance.state.get('userDoc')
    const dimensionDoc = instance.state.get('dimensionDoc')

    // we can only continue if we have loaded the current user doc
    // and the remote is connected AND logged-in
    if (!dimensionDoc || !userDoc || !OtuLea.isLoggedIn()) {
      return instance.state.set({
        records: null,
        recordDates: null,
        competencyCategories: null
      })
    }

    // load all feedbacks from all dimensions here for full-access
    OtuLea.getRecords({
      users: [userDoc.account._id],
      dimension: dimensionDoc._id
    })
      .catch(instance.api.notify)

      // we create a fallback to display in case no feedbacks are available
      .then((records) => {
        if (!records?.length) {
          return instance.state.set({ noRecords: true })
        }
        const dates = new Set()
        records.forEach(r => dates.add(r.completedAt.getTime()))
        const recordDates = Array.from(dates).map(t => new Date(t))
        instance.state.set({ records, recordDates, noRecords: false })
      })
  })
})

Template.user.helpers({
  loadComplete () {
    return Template.getState('initComplete')
  },
  noData () {
    return Template.getState('noData')
  },
  user () {
    return Template.getState('userDoc')
  },
  dimensions () {
    return Dimension.localCollection().find()
  },
  dimensionDoc () {
    return Template.getState('dimensionDoc')
  },
  recordDates () {
    return !Template.getState('noRecords') && Template.getState('recordDates')
  },
  noRecords () {
    return Template.getState('noRecords')
  },
  competencyCategories () {
    return Template.getState('competencyCategories')
  },
  competenciesLoaded () {
    return Template.getState('competenciesLoaded')
  },
  alphaLevels () {
    return Template.getState('alphaLevels')
  },
  accomplishments () {
    return Template.getState('accomplishments')
  },
  development () {
    return Template.getState('development')
  },
  flipped (id) {
    return Template.getState('flipped')[id]
  }
})

Template.user.events({
  'change #dimension-select' (event, templateInstance) {
    const selectedDimension = templateInstance.$(event.currentTarget).val() || null
    const dimensionDoc = selectedDimension && Dimension.localCollection().findOne(selectedDimension)
    const color = selectedDimension && ColorType.byIndex(dimensionDoc.colorType)?.type
    templateInstance.state.set({ dimensionDoc, color })
  },
  'change #record-select' (event, templateInstance) {
    templateInstance.state.set('competenciesLoaded', false)
    const records = templateInstance.state.get('records')
    const recordDates = templateInstance.state.get('recordDates')
    const selected =  templateInstance.$(event.currentTarget).val()

    if (!selected) {
      return templateInstance.state.set({
        competencyCategories: null,
        alphaLevels: null,
      })
    }

    let selectedRecords = records

    if (selected !== 'all') {
      const completedAt = recordDates[selected].getTime()
      selectedRecords = records.filter(r => r.completedAt.getTime() === completedAt)
    }

    const competencies = new Map()
    const alphaLevels = new Map()
    const accomplishments = new Map()
    const development = new Map()
    const allCategory = i18n.get('competency.categories.all')


    selectedRecords.forEach(record => {
      record.alphaLevels.forEach(alphaLevel => {
        if (!alphaLevels.has(alphaLevel._id)) {
          alphaLevel.active = true
          alphaLevels.set(alphaLevel._id, alphaLevel)
        }
      })

      record.competencies.forEach(competency => {
        if (!competencies.has(competency._id)) {
          if (!competency.category) {
            competency.category = allCategory
          }

          competency.isActive = true
          competency.alphaLevel = alphaLevels.get(competency.alphaLevel)
          competency.perc = competency.perc * 100 // scale from 0..1 to 0..100
          competency.icon = getCompetencyIcon(competency)

          const gradeLabel = toCompetencyTranslation(competency.gradeName)

          if (!accomplishments.has(competency.gradeName)) {
            accomplishments.set(competency.gradeName, {
              value: competency.gradeName,
              label: gradeLabel,
              active: true
            })
          }

          competency.gradeLabel = gradeLabel

          const developmentLabel = toCompetencyTranslation(competency.development)

          if (!development.has(competency.development)) {
            development.set(competency.development, {
              value: competency.development,
              label: developmentLabel,
              icon: competency.icon,
              active: true
            })
          }

          competency.developmentLabel = developmentLabel

          competencies.set(competency._id, competency)
        }
      })
    })

    const competencyCategories = new Map()
    competencies.forEach(comp => {
      const list = competencyCategories.has(comp.category)
        ? competencyCategories.get(comp.category)
        : { name: comp.category, entries: [] }
      list.entries.push(comp)
      competencyCategories.set(comp.category, list)
    })

    // sort competencies by alphalevel

    competencyCategories.forEach(value => {
      value.entries.sort((a, b) => {
        return (a.alphaLevel.level - b.alphaLevel.level) + a.shortCode.localeCompare(b.shortCode)
      })
    })

    templateInstance.state.set({
      competencyCategories: Array.from(competencyCategories.values()),
      alphaLevels: Array.from(alphaLevels.values()),
      accomplishments: Array.from(accomplishments.values()),
      development: Array.from(development.values()),
      filters: [],
      flipped: {}
    })

    setTimeout(() => {
      templateInstance.state.set({competenciesLoaded: true })
    }, 300)
  },
  'click .info-icon' (event, templateInstance) {
    event.preventDefault()
    event.stopImmediatePropagation()
    templateInstance.$(event.currentTarget).closest('.flip-card-inner').toggleClass('flip')
  },
  'change .filter-input' (event, templateInstance) {
    const target = dataTarget(event)
    const value = dataTarget(event, 'value')
    const key = dataTarget(event, 'key')
    const active = templateInstance.$(event.currentTarget).prop('checked')

    templateInstance.setFilter({ target, value, key, active })
    templateInstance.applyFilters()
  },
  'click .competency-card' (event, templateInstance) {
    event.preventDefault()
    const competencyId = dataTarget(event)
    const flipped = templateInstance.state.get('flipped')
    flipped[competencyId] = !flipped[competencyId]
    templateInstance.state.set({ flipped })
  }
})
