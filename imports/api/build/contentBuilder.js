import { createContextBuilder } from './createContextBuilder'
import { createCollection } from '../../infrastructure/factories/collection/createCollection'
import { createMethodsDecorator } from '../decorators/createMethodsDecorator'
import { createMethods } from '../../infrastructure/factories/method/createMethods'
import { createPublications } from '../../infrastructure/factories/publication/createPublication'
import { createPublicationsDecorator } from '../decorators/createPublicationsDecorator'
import {
  rateLimitMethods,
  rateLimitPublications
} from '../../infrastructure/factories/ratelimit/rateLimit'
import { ContextRegistry } from '../../contexts/ContextRegistry'

const functions = [
  ctx => {
    const collection = createCollection(ctx)
    ctx.collection = () => collection
  },
  // methods
  createMethodsDecorator({
    get: true,
    all: true,
    insert: true,
    update: true,
    remove: true
  }),
  ctx => {
    const methods = Object.values(ctx.methods)
    createMethods(methods)
    rateLimitMethods(methods)
  },

  // publications
  createPublicationsDecorator({ my: true }),
  ctx => {
    const publications = Object.values(ctx.publications)
    createPublications(publications)
    rateLimitPublications(publications)
  },

  ctx => ContextRegistry.add(ctx.name, ctx)
]

export const contentBuilder = createContextBuilder({ functions })