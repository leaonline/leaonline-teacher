import { OtuLea } from '../../startup/client/remote'

const generateUserMethodName = Meteor.settings.public.hosts.otulea.methods.generateUser

export const generateUser = () => {
  return new Promise((resolve, reject) => {
    if (!OtuLea.connected()) {
      return reject(new Error('Cannot create user, remote is not connected'))
    }

    const callback = (err, res) => {
      if (err) {
        return reject(err)
      }
      resolve(res)
    }

    try {
      OtuLea.connection().call(generateUserMethodName, callback)
    } catch (e) {
      reject(e)
    }
  })
}