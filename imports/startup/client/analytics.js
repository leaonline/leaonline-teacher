import { initAnalytics } from '../../ui/analytics/withAnalytics'
import { logAnalytics } from '../../ui/analytics/logAnalytics'

initAnalytics()

window.addEventListener('unhandledrejection', (event) => {
  logAnalytics({
    aid: 'unhandledrejection',
    event,
    error: typeof event.reason === 'string' ? { reason: event.reason } : event.reason
  })
})

window.addEventListener('error', (event) => {
  logAnalytics({
    aid: 'global-error',
    event,
    error: event.error
  })
})