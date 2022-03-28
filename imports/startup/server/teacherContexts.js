import { ServiceRegistry } from '../../api/ServiceRegistry'
import { Course } from '../../contexts/courses/Course'
import { User } from '../../contexts/users/User'
import { createCollection } from '../../infrastructure/factories/collection/createCollection'
import { createMethods } from '../../infrastructure/factories/method/createMethods'
import { createPublications } from '../../infrastructure/factories/publication/createPublication'
import {
  rateLimitMethods,
  rateLimitPublications
} from '../../infrastructure/factories/ratelimit/rateLimit'
import { ContextRegistry } from '../../contexts/ContextRegistry'
import { Legal } from '../../contexts/legal/Legal'
import { Meteor } from 'meteor/meteor'

[Course, User, Legal].forEach(ctx => {
  console.debug(`[${ctx.name}]: build-pipeline`)
  const collection = createCollection(ctx)
  ctx.collection = () => collection

  const allMethods = Object.values(ctx.methods)
  createMethods(allMethods)
  rateLimitMethods(allMethods)

  const allPubs = Object.values(ctx.publications)
  createPublications(allPubs)
  rateLimitPublications(allPubs)

  ContextRegistry.add(ctx)
})

ServiceRegistry.register(Legal)

// bootstrapping legal docs
Meteor.startup(() => {
  Legal.helpers.init(Legal.collection())
})
