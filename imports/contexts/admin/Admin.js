import { Meteor } from 'meteor/meteor'
import { onServerExec } from '../../utils/arch'

export const Admin = {
  name: 'admin'
}

Admin.methods = {
  sync: {
    name: 'admin.methods.syncCollection',
    schema: {
      name: String
    },
    run: onServerExec(function () {
      import { ContentServer } from '../../api/remotes/ContentServer'
      import { ContextRegistry } from '../ContextRegistry'

      // TODO persist login session to user's services
      // TODO and use the resume token to re-login later
      return async function ({ name }) {
        console.debug('[Admin]: sync', name)
        if (!ContentServer.isConnected()) {
          throw new Meteor.Error('503', 'errors.serviceUnavailable')
        }

        const context = ContextRegistry.get(name)

        if (!context) {
          throw new Meteor.Error('404', 'errors.notFound', { name })
        }

        let updated = 0
        const collection = context.collection()

        let error
        try {
          const user = Meteor.users.findOne(this.userId)
          const login = await ContentServer.login(user)

          console.debug('[Admin]: logged in = ', login)
          const allDocs = await ContentServer.getAll({ context })

          allDocs[name].forEach(doc => {
            const docId = doc._id
            // xxx: some docs contain a deprectaed history field
            delete doc?.meta?.history
            const upsert = collection.upsert(docId, { $set: doc })
            updated += upsert.numberAffected
          })
        }
        catch (e) {
          error = e
        }
        finally {
          await ContentServer.logout()
        }

        if (error) {
          console.error(error)
          throw error
        }

        return updated
      }
    })
  }
}
