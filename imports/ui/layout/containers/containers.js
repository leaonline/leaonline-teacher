import './containers.html'

Template['logged-out-render-target'].onRendered(function () {
  document.documentElement.setAttribute('lang', 'en')
})

Template['main-render-target'].onRendered(function () {
  document.documentElement.setAttribute('lang', 'en')
})