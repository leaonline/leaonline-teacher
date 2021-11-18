import { DDP } from 'meteor/ddp-client'
import { callMethod } from '../../infrastructure/methods/callMethod'
import { isomorphic } from '../../utils/arch'

const connections = new WeakMap()
const getConnection = remote => connections.get(remote)
const login = isomorphic({
  server: function () {
    import { OAuth } from 'meteor/oauth'

    return async function (user) {
      this.debug('login')
      if (!this.isConnected()) {
        throw new Error('remote.notConnected')
      }

      const accessToken = OAuth.sealSecret(user?.services?.lea?.accessToken)
      const options = { accessToken }
      const connection = getConnection(this)
      return await DDP.loginWithLea(connection, options)
    }
  },
  client: function () {
    import { Users } from '../../contexts/Users'

    return function (user) {
      const remote = this
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

class Remote {
  constructor ({ name, url, debug }) {
    this.name = name
    this.url = url
    this.loggedIn =false
    this.debugName = `[${this.name}]:`
    this.debug = debug
      ? (...args) => console.debug(this.debugName, ...args)
      : () => {}
  }

  connect () {
    this.debug('connect', this.url)
    if (getConnection(this)) return

    const connection = DDP.connect(this.url)
    connections.set(this, connection)
  }

  isConnected () {
    const connection = getConnection(this)
    if (!connection) {
      return false
    }

    return connection.status().connected
  }

  disconnect () {
    const connection = getConnection(this)
    if (!connection || !connection.status().connected) {
      throw new Error('remote.notConnected')
    }

    connection.disconnect()
    connections.delete(this)
  }

  async login (user) {
    if (this.loggedIn) {
      this.debug('already logged in')
      return this.loggedIn
    }

    // support isomorphic code so we have an external login method to call
    this.loggedIn = await login.call(this, user)
    return this.loggedIn
  }

  isLoggedIn () {
    return this.loggedIn
  }

  async logout () {
    this.debug('logout')
    if (!this.isConnected()) {
      throw new Error('remote.notConnected')
    }

    const connection = getConnection(this)
    const loggedOut = await DDP.logout(connection)
    this.loggedIn = !loggedOut
    return loggedOut
  }

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

export const createRemote = ({ name, url, debug  }) => {
  return new Remote({ name, url, debug })
}