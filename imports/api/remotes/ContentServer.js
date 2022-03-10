import { Meteor } from 'meteor/meteor'
import { createRemote } from './Remote'
import { ContextRegistry } from '../../contexts/ContextRegistry'

const { content } = Meteor.settings.hosts

export const ContentServer = createRemote(content)

ContentServer.getAll = async ({ context }) => {
  ContentServer.log(context.name, 'getAll for')
  const methodName = `${context.name}.${content.methods.getAll}`
  const token = getToken({ name: methodName })
  const args = { token }

  return await ContentServer.call({
    name: `${context.name}.${content.methods.getAll}`,
    args: args
  })
}

ContentServer.sync = async ({ name, dryRun, debug }) => {
  ContentServer.log('sync', { name, dryRun })

  const context = ContextRegistry.get(name)

  if (!context) {
    throw new Meteor.Error('404', 'errors.notFound', { name })
  }

  const stats = {
    name: name,
    created: 0,
    updated: 0,
    removed: 0,
    skipped: 0
  }

  const collection = context.collection()
  const result = await ContentServer.getAll({ context })
  const allDocs = result && result[name]

  // if there is nothing to get, skip here
  if (!allDocs?.length) { return stats }

  const allIds = []
  allIds.length = allDocs.length

  ContentServer.log(name, 'sync', allDocs.length, 'documents')
  allDocs.forEach((doc, index) => {
    if (dryRun) { return }

    const { _id: docId } = doc
    delete doc.meta

    allIds[index] = docId

    if (collection.find(docId).count() === 0) {
      const insertId = collection.insert(doc)

      if (debug) ContentServer.debug(name, 'inserted', insertId)
      stats.created++
    }

    else {
      delete doc._id
      const updated = collection.update(docId, { $set: doc })

      if (debug) ContentServer.debug(name, 'updated', docId, '=', updated)
      stats.updated++
    }
  })

  if (!dryRun) {
    // remove all docs, that are not in ids anymore
    stats.removed = collection.remove({ _id: { $nin: allIds } })
  }
  ContentServer.log(JSON.stringify(stats))

  return stats
}

/// /////////////////////////////////////////////////////////////////////////////
//
//  INTERNAL
//
/// /////////////////////////////////////////////////////////////////////////////

/**
 * @private
 * generates a function to create jwt
 */
const getToken = (function () {
  const nJwt = require('njwt')
  const signingKey = content.jwt.key
  const url = Meteor.absoluteUrl()
  const claims = {
    iss: url.substring(0, url.length - 1), // The URL of your service
    sub: content.jwt.sub // The UID of the user in your system
  }

  return ({ name }) => {
    const jwt = nJwt.create({ scope: name, ...claims }, signingKey)
    jwt.setExpiration(new Date().getTime() + (60 * 1000)) // One minute from now
    return jwt.compact()
  }
})()
