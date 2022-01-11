import { check, Match } from 'meteor/check'
import { DDP } from 'meteor/ddp-client'
import { ReactiveDict } from 'meteor/reactive-dict'
import { callMethod } from '../../infrastructure/methods/callMethod'
import { isomorphic } from '../../utils/arch'

export const createRemote = ({ name, url, debug }) => {
  return new Remote({ name, url, debug })
}

const connections = new WeakMap()
const getConnection = remote => connections.get(remote)

/**
 * Represents a state between this (server / client) and a remote server.
 *
 * It hold states about
 * - connection
 *
 * - created (no connection initialized yet)
 * - connecting
 * - connection failed
 * - connection timed out
 * - connected
 * - logging in
 * - login successful
 * - login failed
 *
 */
class Remote {
  /**
   * constructor
   * @param {object} options construction options
   *
   */
  constructor (options) {
    check(options, Match.ObjectIncluding({
      name: String,
      url: String
    }))

    const { name, url, debug, defaultTimeout = 3 } = options
    this.name = name
    this.url = url
    this.defaultTimeout = defaultTimeout

    this.loginStatus = new ReactiveDict({
      loggedIn: false,
      loggingIn: false,
      loginError: null,
      loggingOut: false,
      logoutError: null
    })

    this.debugName = `[${this.name}]:`
    this.debug = debug
      ? (...args) => console.debug(this.debugName, ...args)
      : () => {}
  }

  state () {
    const connection = getConnection(this)
    const loginStatus = this.loginStatus.all()

    if (!connection) {
      return {
        status: 'created',
        connected: false,
        connecting: false,
        timedOut: false,
        retryCount: -1,
        retryTime: -1,
        ...loginStatus
      }
    }

    const { status, retryCount, connected, retryTime, reason } = connection.status()
    const timedOut = !connected && retryCount > this.defaultTimeout
    const connecting = ['connecting', 'waiting'].includes(status)

    return {
      status: status,
      connected: connected,
      connecting: connecting,
      timedOut: timedOut,
      retryCount: retryCount,
      retryTime: retryTime,
      reason: reason,
      ...loginStatus
    }
  }

  // ---------------------------------------------------------------------------
  // PART A - Connection
  // ---------------------------------------------------------------------------

  connect ({ reconnect = false } = {}) {
    this.debug('connect', this.url)

    const existingConnection = getConnection(this)
    if (existingConnection) {
      if (reconnect) {
        existingConnection.reconnect()
      }

      return
    }

    const connection = DDP.connect(this.url)
    connections.set(this, connection)
  }

  isConnected () {
    const status = this.state()
    return status.connected
  }

  disconnect () {
    const connection = getConnection(this)
    if (!connection || !connection.status().connected) {
      throw new Error('remote.notConnected')
    }

    connection.disconnect()
    connections.delete(this)
  }

  // ---------------------------------------------------------------------------
  // PART B - Login
  // ---------------------------------------------------------------------------

  async login (user) {
    this.debug('login')

    if (!this.isConnected()) {
      throw new Error('remote.notConnected')
    }

    if (this.loginStatus.get('loggedIn')) {
      this.debug('already logged in')
      return false
    }

    this.debug('logging in')
    this.loginStatus.set('loggingIn', true)

    let loggedIn

    try {
      // support isomorphic code so we have an external login method to call
      loggedIn = await login.call(this, user)
      this.loginStatus.set({ loggedIn })
    }

    catch (loginError) {
      loggedIn = false
      const reason = loginError.reason || loginError.message
      this.loginStatus.set({ loginError, loggedIn, reason })
    }

    finally {
      this.loginStatus.set('loggingIn', false)
    }

    return loggedIn
  }

  isLoggedIn () {
    return this.loginStatus.get('loggedIn')
  }

  async logout () {
    this.debug('logout')

    if (!this.isConnected()) {
      throw new Error('remote.notConnected')
    }

    if (this.loginStatus.get('loggedOut') || !this.loginStatus.get('loggedIn')) {
      this.debug('already logged out / not logged in')
      return false
    }

    this.loginStatus.set('loggingOut', true)

    const connection = getConnection(this)

    let loggedOut
    try {
      loggedOut = await DDP.logout(connection)
      this.debug({ loggedOut })
      this.loginStatus.set('loggedIn', !loggedOut)
    }

    catch (logoutError) {
      loggedOut = false
      const reason = logoutError.reason || logoutError.message
      this.loginStatus.set({ logoutError, loggedOut, reason })
    }

    finally {
      this.loginStatus.set('loggingOut', false)
    }

    return loggedOut
  }

  // ---------------------------------------------------------------------------
  // PART C - Communication
  // ---------------------------------------------------------------------------

  async call ({ name, args }) {
    this.debug('call', name, { args })
    if (!this.isConnected()) {
      throw new Error('remote.notConnected')
    }

    const connection = getConnection(this)
    return await callMethod({ name, args, connection })
  }

  // TODO: async subscribe () {}
}

/**
 * @private
 */

const login = isomorphic({
  server: function () {
    import { OAuth } from 'meteor/oauth'

    return async function (user) {
      const remote = this
      remote.debug('login user', user?._id)

      if (!remote.isConnected()) {
        throw new Error('remote.notConnected')
      }

      remote.debug('services', user)
      const loginTokens = OAuth.sealSecret(user?.services?.resume?.loginTokens)
      const { hashedToken } = loginTokens.pop()
      const accessToken = OAuth.sealSecret(user?.services?.lea?.accessToken)
      const options = { accessToken, resume: hashedToken, debug: true }
      const connection = getConnection(remote)

      return DDP.loginWithLea(connection, options)
    }
  },
  client: function () {
    import { Users } from '../../contexts/Users'

    return function (user) {
      const remote = this
      remote.debug('login user', user?._id)

      return new Promise((resolve, reject) => {
        const connection = getConnection(remote)

        if (!remote.isConnected()) {
          return reject(new Error('remote.notConnected'))
        }

        Users.methods.getServiceCredentials.call((err, credentials) => {
          if (err) {
            connection._loggingIn = false
            return reject(err)
          }

          if (!credentials) {
            connection._loggingIn = false
            remote.debug('no credentials received, skip login')
            return reject(new Error('remote.noCredentials'))
          }

          remote.debug('credentials received; init login')
          const options = {
            accessToken: credentials.accessToken,
            debug: true
          }

          DDP.loginWithLea(connection, options, (loginError, res) => {
            connection._loggingIn = false

            if (loginError) {
              return reject(loginError)
            }
            else {
              remote.debug('logged in with token', !!res)
              return resolve(!!res)
            }
          })
        })
      })
    }
  }
})
