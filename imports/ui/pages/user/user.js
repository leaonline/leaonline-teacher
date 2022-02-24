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
import { ColorType } from '../../../contexts/content/color/ColorType'
import { callMethod } from '../../../infrastructure/methods/callMethod'
import { loadDimensions } from '../../loaders/loadDimensions'
import { getCompetencyIcon } from '../../utils/competency/getCompetencyIcon'
import { translationStringFactory } from '../../../api/i18n/translationStringFactory'
import { dataTarget } from '../../utils/dataTarget'
import { loadCompetencyCategories } from '../../loaders/loadCompetencyCategories'
import { loadExampleTexts } from '../../loaders/loadExampleTexts'
import { debounce } from '../../utils/debounce'
import userLanguage from './i18n/userLanguage'
import './user.scss'
import './user.html'

const toCompetencyTranslation = translationStringFactory('competency')

Template.user.onCreated(function () {
  const instance = this

  // set defaults to prevent access errors in helpers
  instance.state.set('filters', [])
  instance.state.set('flipped', {})
  instance.state.set('exampleTexts', {})

  instance.init({
    contexts: [Course, Competency, CompetencyCategory, Dimension, AlphaLevel, User],
    remotes: [OtuLea],
    useLanguage: [userLanguage],
    onComplete () {
      loadDimensions().catch(instance.api.notify)
      instance.state.set('initComplete', true)
    }
  })

  // ///////////////////////////////////////////////////////////////////////////
  // GENERAL API
  // ///////////////////////////////////////////////////////////////////////////

  instance.setDimension = dimensionId => {
    const dimensionDoc = dimensionId && Dimension.localCollection().findOne(dimensionId)
    if (dimensionId && !dimensionDoc) {
      const dimensionDocs = Dimension.localCollection().find().map(d => d._id)
      return console.warn('could not set dimension doc', dimensionId, 'in', dimensionDocs.toString())
    }
    const color = dimensionId && ColorType.byIndex(dimensionDoc.colorType)?.type
    instance.state.set({ dimensionDoc, color })
  }

  // ///////////////////////////////////////////////////////////////////////////
  // FILTERING API
  // ///////////////////////////////////////////////////////////////////////////

  /**
   * Reset all filters AND search
   */
  instance.resetFilter = () => {
    instance.state.set('filters', [])
  }

  /**
   * Applies all added filters and search to the current
   * processed list of data and set the filtered list to the instance state
   */
  instance.applyFilters = () => {
    const filters = instance.state.get('filters') || []
    const search = instance.state.get('search') || ''
    const competencyCategories = instance.state.get('competencyCategories')

    competencyCategories.forEach(category => {
      category.entries.forEach(competency => {
        let disabled

        if (search.length > 0) {
          const found = [
            competency.shortCode,
            competency.description,
            competency.example
          ].some(target => target && target.toLowerCase().includes(search))
          disabled = !found
        }

        else {
          disabled = filters.some(({ target, hasKey, key, value }) => {
            if (!competency[target]) return false

            const prop = hasKey
              ? competency[target][key]
              : competency[target]

            return prop == value // eslint-disable-line
          })
        }

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

  // ///////////////////////////////////////////////////////////////////////////
  // GET USERS
  // ///////////////////////////////////////////////////////////////////////////

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
        const hasAccount = !!(userDoc?.account?._id)
        State.currentParticipant(userDoc)
        instance.state.set({ userDoc, sessionId, hasAccount })
      }
    })

  })

  // ///////////////////////////////////////////////////////////////////////////
  // GET MOST RECENT
  // ///////////////////////////////////////////////////////////////////////////

  // load the most recent feedback to automatically
  // display the last test
  instance.autorun(() => {
    const userDoc = instance.state.get('userDoc')

    if (!userDoc?.account?._id || !OtuLea.isLoggedIn()) { return }

    OtuLea.recentFeedback({ users: [userDoc.account._id], resolve: true })
      .catch(instance.api.notify)
      .then((sessionDocs = []) => {
        // if we received a doc we store it in the state and see, if we
        // can use it, once the other docs have been loaded
        instance.state.set({ recentSession: sessionDocs[0] })
      })
  })

  // ///////////////////////////////////////////////////////////////////////////
  // GET RECORDS
  // ///////////////////////////////////////////////////////////////////////////

  // for gathering the data we create a two-step process:
  // 1. get all sessions by dimension and provide a select component
  // 2. load the feedback doc(s) for the selected session or all sessions

  instance.autorun(() => {
    const userDoc = instance.state.get('userDoc')
    const hasAccount = instance.state.get('hasAccount')
    const dimensionDoc = instance.state.get('dimensionDoc')

    // reset data to null to remove elements from DOM when user changes
    instance.state.set({
      records: null,
      recordDates: null,
      alphaLevels: null,
      accomplishments: null,
      development: null,
      competencyCategories: null,
      competenciesLoaded: null
    })

    // we can only continue if we have loaded the current user doc
    // and the remote is connected AND logged-in
    if (!dimensionDoc || !userDoc || !hasAccount || !OtuLea.isLoggedIn()) { return }

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

        // auto-apply selecting recent session por latest date
        // depending on what auto-selecting mechanism we have used
        // see Template.onRendered for dimension selection logic
        const recentSession = instance.state.get('recentSession')
        const autoSelectLatestDate = instance.state.get('autoSelectLatestDate')

        if (recentSession) {
          const { completedAt } = recentSession
          const completedIndex = recordDates.findIndex(d => {
            return d.toLocaleDateString() === completedAt.toLocaleDateString()
          })

          // only apply if the record is in the list
          if (completedIndex > -1) {
            loadCompetencies(completedIndex.toString(10), instance)
            setTimeout(() => {
              const $select = document.querySelector('#record-select')
              if ($select) $select.value = completedIndex
            }, 100)
          }
        }

        // here we take '0' as the zero-index string value as the assumed
        // latest date so we load competencies for this date automatically
        // however this won't work when there are no records for the dimension
        else if (autoSelectLatestDate && recordDates.length > 0) {
          loadCompetencies('0', instance)
          setTimeout(() => {
            const $select = document.querySelector('#record-select')
            if ($select) $select.value = '0'
          }, 100)
        }

        else {
          console.warn('could neither set recent session nor auto last date')
        }
      })
  })

})

Template.user.onRendered(function () {
  const instance = this

  // ///////////////////////////////////////////////////////////////////////////
  // APPLY MOST RECENT
  // ///////////////////////////////////////////////////////////////////////////

  // if we found a recent doc and data has been loaded we can try
  // to set the current doc and auto-load the results
  instance.autorun(() => {
    const data = Template.currentData()
    const currentDimension = data.queryParams.dimension
    const recentSession = instance.state.get('recentSession')
    const initComplete = instance.state.get('initComplete')
    const dimensionDoc = instance.state.get('dimensionDoc')

    // skip either if
    // - we already have a selected dimension
    // - we have not initialized
    // - we are not logged in
    // - we no auto-values to be set
    if (dimensionDoc || !initComplete || !OtuLea.isLoggedIn() ||
      (!currentDimension && !recentSession)) {
      return
    }

    let dimensionToSelect = undefined
    let autoSelectLatestDate = true

    // selection from class page beats auto-selecting last test
    if (currentDimension !== null && currentDimension !== undefined) {
      dimensionToSelect = currentDimension
      autoSelectLatestDate = true
    }

    else {
      dimensionToSelect = recentSession?.testCycle?.dimension
    }

    // skip if we have nothing to select anyway
    if (!dimensionToSelect) { return }

    setTimeout(() => {
      const $select = document.querySelector('#dimension-select')
      const element = [...$select.options].some(option => {
        return option.value === dimensionToSelect
      })

      if (element) {
        $select.value = dimensionToSelect
        instance.setDimension(dimensionToSelect)
        instance.state.set({ autoSelectLatestDate })
      }
      else {
        console.warn('skip attempt to select a non-existent dimension', currentDimension)
      }
    }, 100)
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
  selectedDates () {
    return Template.getState('selectedDates')
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
  exampleText (_id) {
    return _id && Template.getState('exampleTexts')[_id]
  },
  flipped (id) {
    return Template.getState('flipped')[id]
  },
  hasNoAccount () {
    return Template.getState('userDoc') && !Template.getState('hasAccount')
  }
})

Template.user.events({
  'change #dimension-select' (event, templateInstance) {
    const selectedDimension = templateInstance.$(event.currentTarget).val() || null

    // changing dimension removes all auto-behaviour triggers
    templateInstance.api.queryParam({ dimension: null })
    templateInstance.state.set('recentSession', null)
    templateInstance.state.set('autoSelectLatestDate', null)
    State.currentDimension(null)

    templateInstance.setDimension(selectedDimension)
  },
  'change #record-select' (event, templateInstance) {
    templateInstance.state.set('competenciesLoaded', false)
    templateInstance.state.set('recentSession', null)
    templateInstance.state.set('autoSelectLatestDate', null)
    const selected = templateInstance.$(event.currentTarget).val()
    loadCompetencies(selected, templateInstance)
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
  'click .reset-filter-btn' (event, templateInstance) {
    event.preventDefault()
    event.stopPropagation() // prevent checkbox change dispatch

    templateInstance.state.set({ search: null })
    templateInstance.$('#search-input').val(null)
    templateInstance.resetFilter()
    templateInstance.$('.filter-input').prop('checked', true)
    templateInstance.applyFilters()
  },
  'click .competency-card' (event, templateInstance) {
    event.preventDefault()
    const competencyId = dataTarget(event)
    const flipped = templateInstance.state.get('flipped')
    flipped[competencyId] = !flipped[competencyId]
    templateInstance.state.set({ flipped })
  },
  'input #search-input': debounce(function (event, templateInstance) {
    const search = (event.target.value || '').toLowerCase()
    templateInstance.state.set({ search })
    templateInstance.applyFilters()
  }, 300)
})

const loadCompetencies = (selectedDate, templateInstance) => {
  if (!selectedDate) {
    return templateInstance.state.set({
      competencyCategories: null,
      alphaLevels: null,
      selectedDates: null
    })
  }

  const records = templateInstance.state.get('records')
  const recordDates = templateInstance.state.get('recordDates')
  let selectedRecords = records

  if (selectedDate !== 'all') {
    const completedAt = recordDates[selectedDate].getTime()
    selectedRecords = records.filter(r => r.completedAt.getTime() === completedAt)
  }

  templateInstance.state.set({
    selectedDates: selectedRecords.map(r => r.completedAt.toLocaleDateString())
  })

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

  // use competencies map to load example texts
  const ids = [...competencies.keys()]

  if (ids.length > 0) {
    loadExampleTexts(ids)
      .then(exampleTexts => templateInstance.state.set({ exampleTexts }))
      .catch(e => templateInstance.api.notify(e))
  }

  const competencyCategories = new Map()
  competencies.forEach(comp => {
    const list = competencyCategories.has(comp.category)
      ? competencyCategories.get(comp.category)
      : { name: comp.category, entries: [], active: true }
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

  const categoryIds = [...competencyCategories.keys()]

  if (categoryIds.length > 0) {
    loadCompetencyCategories(categoryIds)
      .catch(e => templateInstance.api.notify(e))
      .then(() => {
        const categories = (templateInstance.state.get('competencyCategories') || []).map(cat => {
          const catDoc = CompetencyCategory.localCollection().findOne(cat.name)
          cat.label = cat.name

          if (!catDoc) { return cat }

          cat.label = catDoc.title
          return cat
        })
        templateInstance.state.set({
          competencyCategories: categories.sort((a, b) => a.name.localeCompare(b.name))
        })
      })
  }

  setTimeout(() => {
    templateInstance.state.set({ competenciesLoaded: true })
  }, 300)
}