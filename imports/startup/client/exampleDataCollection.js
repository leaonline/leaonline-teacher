import { Mongo } from 'meteor/mongo'
import courseInfo from '../../../resources/exampleData/coursesInfo'

export const exampleDataRunningCourses = new Mongo.Collection(null)
export const exampleDataNotStartedCourses = new Mongo.Collection(null)
export const exampleDataCompletedCourses = new Mongo.Collection(null)

const runningCoursesInfojson = courseInfo.courses.runningCourses
const notStartedCoursesInfojson = courseInfo.courses.notStartedCourses
const completedCoursesInfojson = courseInfo.courses.completedCourses

for (const key in runningCoursesInfojson) {
  exampleDataRunningCourses.insert({ title: runningCoursesInfojson[key].title, startedAt: new Date() })
}

for (const key in notStartedCoursesInfojson) {
  exampleDataNotStartedCourses.insert({ title: notStartedCoursesInfojson[key].title })
}

for (const key in completedCoursesInfojson) {
  exampleDataCompletedCourses.insert({ title: completedCoursesInfojson[key].title, startedAt: new Date(), completedAt: new Date() })
}
