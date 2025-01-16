import { onServer } from '../../utils/arch'

export const Analytics = {
  name: 'analytics',
  label: 'courses.title',
  icon: 'users'
}

Analytics.methods = {}
Analytics.methods.send = {
  name: 'analytics.methods.send',
  schema: {
    timestamp: Date,
    path: String,
    event: String,
    template: String,
    target: String,
    current: String,
    error: {
      type: Object,
      optional: true,
      blackbox: true
    }
  },
  run: onServer(async function (data) {
    const { userId } = this

  })
}