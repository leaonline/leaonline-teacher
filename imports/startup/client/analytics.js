import { initAnalytics } from '../../ui/analytics/withAnalytics'
import { logAnalytics } from '../../ui/analytics/logAnalytics'

initAnalytics()

window.addEventListener('unhandledrejection', (event) => {
  logAnalytics({
    event,
    error: typeof event.reason === 'string' ? { reason: event.reason } : event.reason
  })
})

window.addEventListener('error', (event) => {
  logAnalytics({
    event,
    error: event.errro
  })
})