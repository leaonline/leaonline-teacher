import { EJSON } from 'meteor/ejson'
import { Analytics } from '../Analytics'
import crypto from 'node:crypto'

/**
 * Adds an analytics record if it's not an exact duplicate of an already existing record.
 * @param data {object}
 * @return {Promise<string|undefined>}
 */
export const addAnalytics = async (data) => {
  const AnalyticsCollection = Analytics.collection()
  const hash = createHash(data)
  const isDuplicate = await AnalyticsCollection.countDocuments({ hash }) > 0

  if (!isDuplicate) {
    return AnalyticsCollection.insertAsync({ hash, ...data })
  }
}

/**
 * Creates a reproducible md5 has from given EJSON-able object.
 * @private
 * @param data {object}
 * @return {string}
 */
const createHash = data => {
  const str = EJSON.stringify(data, null, 0)
  return crypto.createHash('md5').update(str).digest('hex')
}
