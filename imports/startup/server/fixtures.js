import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { Participants } from '../../api/collections/Participants/Participants'
import { Responses } from '../../api/collections/Responses/Responses'
import { Courses } from '../../api/collections/Courses/Courses'
import { Feedback } from '../../api/collections/Feedback/Feedback'
import { Scores } from '../../api/collections/Scores/Scores'
import participants from '../../../resources/fixtures/participants'
import feedback from '../../../resources/fixtures/feedback'
import responses from '../../../resources/fixtures/responses'
import scores from '../../../resources/fixtures/scores'

const fixtures = Object.assign({}, Meteor.settings.fixtures, participants, feedback, responses, scores)

if (Meteor.isDevelopment && fixtures) {
  Meteor.startup(() => {
    [Participants, Responses, Courses, Feedback, Scores].forEach(context => {
      // on server we include the data and
      // publish to the client immediately
      const { name } = context
      const collection = context.collection()

      if (!fixtures[name]) return

      fixtures[name].forEach(document => {
        const documentId = document._id || Random.id()
        if (collection.findOne(documentId)) return

        const normalizedDocument = context.api.normalize(document)
        collection.insert(normalizedDocument)
        console.info(`[fixtures][${name}]: inserted ${documentId}`)
      })
    })
  })
}
