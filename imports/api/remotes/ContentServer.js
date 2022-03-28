import { Meteor } from 'meteor/meteor'
import { createRemote } from './Remote'
import { ContextRegistry } from '../../contexts/ContextRegistry'

const { content } = Meteor.settings.hosts

/**
 * Facade to the external content-application,
 * providing common API for connecting and method calls.
 *
 * @type {Remote}
 */
export const ContentServer = createRemote(content)

/**
 * Synchronizes a whole collection for a given context by name
 * @param name {string}
 * @param dryRun {boolean} defaults to true; apply writes to db
 * @param debug {boolean} defaults to false; additional debug messages
 * @return {Promise<{name: *, created: number, updated: number, removed: number, skipped: number}>}
 */
ContentServer.sync = async ({ name, dryRun = true, debug = false }) => {
  ContentServer.log('sync', { name, dryRun })

  const context = ContextRegistry.get(name)

  if (!context) {
    throw new Meteor.Error('content.sync.error', 'errors.contextNotFound', { name })
  }

  // count all operations and return this object at the end
  const stats = {
    name: name,
    dryRun: dryRun,
    created: 0,
    updated: 0,
    removed: 0,
    skipped: 0
  }

  const collection = context.collection()
  const result = await loadAllDocs({ context })
  const allDocs = result && result[name]

  // if there is nothing to get, skip here
  if (!allDocs?.length) { return stats }

  const allIds = []
  allIds.length = allDocs.length

  ContentServer.log(name, 'sync', allDocs.length, 'documents')

  allDocs.forEach((doc, index) => {
    const { _id: docId } = doc
    delete doc.meta

    allIds[index] = docId

    if (collection.find(docId).count() === 0) {
      const insertId = !dryRun && collection.insert(doc)

      if (debug) ContentServer.debug(name, 'inserted', insertId)
      stats.created++
    }

    else {
      delete doc._id
      const updated = !dryRun && collection.update(docId, { $set: doc })

      if (debug) ContentServer.debug(name, 'updated', docId, '=', updated)
      stats.updated++
    }
  })

  // remove all docs, that are not in ids anymore
  stats.removed = !dryRun && collection.remove({ _id: { $nin: allIds } })

  // always log the stats
  ContentServer.log(JSON.stringify(stats))

  return stats
}

/// /////////////////////////////////////////////////////////////////////////////
//
//  INTERNAL
//
/// /////////////////////////////////////////////////////////////////////////////

/**
 * Loads all docs from the content server
 * @private
 * @param context
 * @return {Promise<[Object]>}
 */
const loadAllDocs = async ({ context }) => {
  ContentServer.log(context.name, 'getAll for')
  const methodName = `${context.name}.${content.methods.getAll}`
  const token = getToken({ name: methodName })
  const args = { token }

  return await ContentServer.call({
    name: `${context.name}.${content.methods.getAll}`,
    args: args
  })
}

/**
 * generates a function to generate JWT
 * @private
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
