import { createMyPublication } from './createMyPublication'

export const createPublicationsDecorator = ({ my }) => context => {
  context.publications = context.publications || {}

  if (my) {
    context.publications.my = createMyPublication({ context  })
  }

  return context
}
