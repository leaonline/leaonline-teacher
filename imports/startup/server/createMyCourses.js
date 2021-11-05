import { Course } from '../../contexts/courses/Course'
import { createCollection } from '../../infrastructure/factories/collection/createCollection'
import { createMethods } from '../../infrastructure/factories/method/createMethods'
import { createPublications } from '../../infrastructure/factories/publication/createPublication'
import {
  rateLimitMethods,
  rateLimitPublications
} from '../../infrastructure/factories/ratelimit/rateLimit'

const collection = createCollection(Course)
Course.collection = () => collection

const allMethods = Object.values(Course.methods)
createMethods(allMethods)
rateLimitMethods(allMethods)

const allPubs = Object.values(Course.publications)
createPublications(allPubs)
rateLimitPublications(allPubs)
