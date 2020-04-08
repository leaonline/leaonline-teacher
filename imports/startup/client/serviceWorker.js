import { Meteor } from 'meteor/meteor'

// see https://github.com/NitroBAY/meteor-service-worker
Meteor.startup(() => {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => console.info('service worker registered'))
    .catch(error => {
      console.log('ServiceWorker registration failed: ', error)
    })
})
