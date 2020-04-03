import { Meteor } from 'meteor/meteor'

// We defer any style call to a later point in order
// to speed up initial page load and time to display
Meteor.startup(() => {
  Promise.all([
    import('./bootstrap'),
    import('./fontawesome')
  ]).catch(e => console.error(e))
})
