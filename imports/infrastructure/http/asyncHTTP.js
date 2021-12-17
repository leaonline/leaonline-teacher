import { HTTP } from 'meteor/jkuester:http'
import { check, Match } from 'meteor/check'

/**
 * Wraps {HTTP.call} with a Promise. Everything else is the same.
 *
 * @see meteor/jkuester:http
 * @param method {String} the name of the HTTP method (get, post, ...)
 * @param url {String} the endpoint to call on
 * @param requestOptions {Object|undefined} request options
 * @return {Promise}
 */
export const asyncHTTP = (method, url, requestOptions = {}) => {
  check({ method, url }, Match.ObjectIncluding({ method: String, url: String }))

  return new Promise((resolve, reject) => {
    HTTP.call(method, url, requestOptions, (error, response) => {
      if (error) {
        return reject(error)
      }

      resolve(response)
    })
  })
}
