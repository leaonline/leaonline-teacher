import { Meteor } from 'meteor/meteor'
import { createRemote } from './Remote'

const { content } = Meteor.settings.hosts

export const ContentServer = createRemote(content)

ContentServer.getAll = async ({ context }) => {
  ContentServer.debug('getAll')

  return await ContentServer.call({
    name: `${context.name}.${content.methods.getAll}`,
    args: {}
  })
}
