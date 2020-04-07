import { Meteor } from 'meteor/meteor'
import { Participants } from '../../api/collections/Participants/Participants'
import { Responses } from '../../api/collections/Responses/Responses'
import { Courses } from '../../api/collections/Courses/Courses'
import { createCollection } from '../../factories/createCollection'
import { Feedback } from '../../api/collections/Feedback/Feedback'
import { Scores } from '../../api/collections/Scores/Scores'

[Participants, Responses, Courses, Feedback, Scores].forEach(context => {
  const Collection = createCollection(context)
  context.collection = () => Collection
  if (Meteor.isDevelopment) {
    console.info(`[Collection]: ${context.name} created`)
  }
})
