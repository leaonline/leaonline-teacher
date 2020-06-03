import { Meteor } from 'meteor/meteor'
import courseInfo from '../../../resources/exampleData/coursesInfo'
import { MyCourses } from '../../api/collections/MyCourses'

Meteor.startup(() => {
  courseInfo.forEach(document => MyCourses.insert(document))
})
