import { Meteor } from 'meteor/meteor'
import courseInfo from '../../../resources/exampleData/coursesInfo'
import competencyCategories from '../../../resources/exampleData/competencyCategories'
import competency from '../../../resources/exampleData/competency'
import { MyCourses } from '../../api/collections/MyCourses'
import { CompetencyCategories } from '../../api/collections/competencyCategories'
import { Competency } from '../../api/collections/competency'

Meteor.startup(() => {
  courseInfo.forEach(document => MyCourses.api.insert(document))
  competencyCategories.forEach(document => CompetencyCategories.api.insert(document))
  competency.forEach(document => Competency.api.insert(document))
})
