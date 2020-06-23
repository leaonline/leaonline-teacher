import { Meteor } from 'meteor/meteor'
import courseInfo from '../../../resources/exampleData/coursesInfo'
import { MyCourses } from '../../api/collections/MyCourses'

Meteor.startup(() => {
  console.log(MyCourses)
  // courseInfo.forEach(document => MyCourses.api.insert(document))
})
