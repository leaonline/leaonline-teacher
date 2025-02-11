import { expect } from 'chai'
/**
 * expects an async function to throw with given message
 * @param fn
 * @param error
 * @param reason
 * @param message
 * @param details
 * @return {Promise<*>}
 */
export const expectThrow = async function ({ fn, error, reason, message, details }) {
  try {
    await fn()
    expect.fail()
  }
  catch (e) {
    if (error) expect(e.error).to.include(error)
    if (message) expect(e.message).to.include(message)
    if (reason) expect(e.reason).to.include(reason)
    if (details) expect(e.details).to.deep.equal(details)
    return e
  }
}
