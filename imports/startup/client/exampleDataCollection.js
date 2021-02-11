import { Meteor } from 'meteor/meteor'
import courseInfo from '../../../resources/exampleData/coursesInfo'
import competencyCategories from '../../../resources/exampleData/competencyCategories'
import { MyCourses } from '../../api/collections/MyCourses'
import { CompetencyCategories } from '../../api/collections/competencyCategories'

Meteor.startup(() => {
  courseInfo.forEach(document => MyCourses.api.insert(document))
  competencyCategories.forEach(document => CompetencyCategories.api.insert(document))
})
