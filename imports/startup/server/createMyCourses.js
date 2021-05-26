import { Courses } from '../../api/collections/Courses'
import { createCollection } from '../../infrastructure/factories/collection/createCollection'
import { createMethods } from '../../infrastructure/factories/method/createMethods'
import { createPublications } from '../../infrastructure/factories/publication/createPublication'
import {
  rateLimitMethods,
  rateLimitPublications
} from '../../infrastructure/factories/ratelimit/rateLimit'

const collection = createCollection(Courses)
Courses.collection = () => collection

const allMethods = Object.values(Courses.methods)
createMethods(allMethods)
rateLimitMethods(allMethods)


const allPubs = Object.values(Courses.publications)
createPublications(allPubs)
rateLimitPublications(allPubs)

