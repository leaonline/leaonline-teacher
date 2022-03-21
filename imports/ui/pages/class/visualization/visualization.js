import { Template } from 'meteor/templating'
import visualizationLanguage from './i18n/visualizationLanguage'
import './visualization.scss'
import './visualization.html'
import { dataTarget } from '../../../utils/dataTarget'

Template.visualization.onCreated(function () {
  const instance = this
  instance.init({
    useLanguage: [visualizationLanguage],
    onComplete: () => instance.state.set('initComplete', true)
  })
})

const ascending = (a, b) => b - a

Template.visualization.onRendered(function () {
  const instance = this

  instance.autorun(() => {
    const { entries } = Template.currentData()
    const initComplete = instance.state.get('initComplete')

    if (!initComplete) { return }

    const userFilter = instance.state.get('userFilter') || {}
    const alphaLevels = new Map()
    const dates = new Set()
    const userData = {}
    const userNames = new Set()
    const userHasData = {}

    entries.forEach(({ name, allDate }) => {
      userNames.add(name)

      // if user is not defined in filter
      // we can safely add here as displayable
      if (!(name in userFilter)) {
        userFilter[name] = true
      }

      allDate.forEach(({ date, level }) => {
        dates.add(date)

        if (!userData[date])userData[date] = {}
        if (!userHasData[date]) userHasData[date] = {}
        userHasData[date][name] = true

        level.forEach(({ alpha, value, title, description }) => {
          alphaLevels.set(alpha, { label: alpha, title, description })

          // if the user is explicitly filtered ou
          // we skip here, so the date won't arrive
          // at the graph template at all
          if (userFilter[name] === false) return

          if (!userData[date][alpha]) {
            userData[date][alpha] = []
          }

          userData[date][alpha].push({
            name: name,
            value: value,
            result: level.filter(l => l.value)
          })
        })
      })
    })

    instance.state.set({
      processingComplete: true,
      alphaLevels: [...alphaLevels.values()],
      dates: [...dates.values()],
      userData: userData,
      userNames: [...userNames.values()],
      userFilter: userFilter,
      userHasData: userHasData
    })
  })
})

Template.visualization.helpers({
  loadComplete () {
    return Template.getState('initComplete')
  },
  processingComplete () {
    return Template.getState('processingComplete')
  },
  alphaLevels () {
    return Template.getState('alphaLevels')
  },
  dates () {
    return Template.getState('dates')
  },
  getUserData (date, level, username) {
    const data = Template.getState('userData')
    const entries = data && data[date] && data[date][level]

    if (!entries) return

    return typeof username === 'string'
      ? entries.find(el => el.name === username)
      : entries
  },
  userHasData (date, userName) {
    const userHasData = Template.getState('userHasData')
    if (!userHasData) return
    return userHasData[date] && userHasData[date][userName]
  },
  userNames () {
    return Template.getState('userNames')
  },
  isActive (username) {
    if (!username) { return false }
    if (Template.getState('activeUser') === username) {
      return true
    }
    return Template.getState('hoverUser') === username
  },
  isPassive (username) {
    if (!username) { return false }
    const activeUser = Template.getState('activeUser')
    return activeUser && activeUser !== username
  },
  isChecked (username) {
    const userFilter = Template.getState('userFilter')
    return userFilter && userFilter[username]
  }
})

Template.visualization.events({
  'mouseenter .barline' (event, templateInstance) {
    const id = event.target.id
    const activeUser = templateInstance.state.get('activeUser')

    if (activeUser) { return }

    templateInstance.state.set('hoverUser', id)
  },
  'click .barline' (event, templateInstance) {
    const id = event.target.id
    const activeUser = templateInstance.state.get('activeUser')

    templateInstance.state.set({
      activeUser: activeUser === id
        ? null
        : id
    })
  },
  'mouseleave .barline' (event, templateInstance) {
    const id = event.target.id
    const activeUser = templateInstance.state.get('activeUser')

    if (id === activeUser) { return }

    templateInstance.state.set('hoverUser', null)
  },
  'click #buttonPlus' (event, templateInstance) {
    event.preventDefault()
    const myImg = document.getElementById('graphwrap')
    const zval = document.getElementById('zomval')
    const currWidth = myImg.clientWidth
    if (currWidth === 2500) return false
    else {
      myImg.classList.add('zoomin1')
      zval.innerHTML = '100%'
    }
    myImg.classList.remove('zoomout1')
  },

  'click #buttonMinus' (event, templateInstance) {
    event.preventDefault()
    const myImg = document.getElementById('graphwrap')
    const zval = document.getElementById('zomval')
    const currWidth = myImg.clientWidth
    if (currWidth === 100) return false
    else {
      myImg.classList.add('zoomout1')
    }
    myImg.classList.remove('zoomin1')
    zval.innerHTML = '200%'
  },

  'change .user-checkbox' (event, templateInstance) {
    event.preventDefault()
    const username = dataTarget(event)
    const userFilter = templateInstance.state.get('userFilter')
    userFilter[username] = !userFilter[username]
    templateInstance.state.set({ userFilter })
  }
})
