import { Meteor } from 'meteor/meteor'
import { DDP } from 'meteor/ddp-client'
import { toContentServerURL } from './toContentServerUrl'
import { asyncHTTP } from '../../infrastructure/http/asyncHTTP'
import { callMethod } from '../../infrastructure/methods/callMethod'
import { OAuth } from 'meteor/oauth'

export const ContentServer = {}

const { content } = Meteor.settings.hosts
const connection = DDP.connect(content.url)

ContentServer.isAvailable = () => connection.status().connected

ContentServer.getAll = ({ context }) => {
  const method = `${context.name}.${content.methods.getAll}`
  console.debug('[ContentServer]:', method)
  return callMethod({
    name: method,
    args: {},
    connection
  })
}

ContentServer.login = async (userId) => {
  const user = Meteor.users.findOne(userId)
  const accessToken = OAuth.sealSecret(user?.services?.lea?.accessToken)
  const options = { accessToken }
  console.debug('[ContentServer]: login')
  return await DDP.loginWithLea(connection, options)
}


ContentServer.logout = async () => {
  console.debug('[ContentServer]: logout')
  return await DDP.logout(connection)
}

/**
 * Loads all docs from the content-server by given params.
 * @param context {Object} The context the objects belong to
 * @param params {Object?} optional additional parameters
 * @param debug {Function?} optional debug logger
 * @return {Promise}
 */
ContentServer.loadAllContentDocs = async (context, params, debug = () => {}) => {
  const route = context.routes.all
  const collection = context.collection()
  const url = toContentServerURL(route.path)
  const method = route.method.toUpperCase()
  const requestOptions = {}

  requestOptions.headers = {
    mode: 'cors',
    cache: 'no-store'
  }

  if (params) {
    requestOptions.params = params
  }

  debug(method, url, 'start request')
  debug(method, url, 'request options', requestOptions)

  const response = await asyncHTTP(method, url, requestOptions)
  let documents

  if (Array.isArray(response.data)) {
    documents = response.data
  }

  else if (response.data) {
    documents = [response.data]
  }

  else {
    documents = []
  }

  // skip further processing if no documents have been received
  if (documents.length === 0) {
    debug(method, url, 'failed (no docs received)')
    return documents
  }

  debug(method, url, `received ${documents.length} doc(s)`)
  documents.forEach(doc => {
    if (!doc?._id) {
      throw new Error(`[${context.name}]: Expected doc with _id to upsert`)
    }
    const docId = doc._id
    delete doc._id
    delete doc.meta // TODO add meta to schema

    collection.upsert(doc._id, { $set: doc })
    doc._id = docId
  })

  return documents
}
