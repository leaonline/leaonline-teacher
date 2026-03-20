import { onServer, onServerExec } from '../../utils/arch'

export const Analytics = {
  name: 'analytics',
  label: 'analytics.title',
  icon: 'flask',
  main: 'userId'
}

/**
 * @type {function():Mongo.Collection}
 */
Analytics.collection = null

Analytics.schema = {
  userId: {
    type: String,
    optional: true
  },
  timestamp: Date,
  path: String,
  event: {
    type: String,
    optional: true
  },
  aid: {
    type: String,
    optional: true
  },
  title: {
    type: String,
    optional: true
  },
  label: {
    type: String,
    optional: true
  },
  template: {
    type: String,
    optional: true
  },
  target: {
    type: String,
    optional: true
  },
  current: {
    type: String,
    optional: true
  },
  error: {
    type: Object,
    optional: true,
    blackbox: true
  },
  value: {
    type: Object,
    optional: true,
    blackbox: true
  }
}

Analytics.methods = {}

/**
 * Sends analytics data to the backend.
 * @type {object}
 */
Analytics.methods.send = {
  name: 'analytics.methods.send',
  schema: Analytics.schema,
  run: onServerExec(() => {
    import { Meteor } from 'meteor/meteor'
    import { addAnalytics } from './api/addAnalytics'

    return async function (data) {
      const { userId } = this
      if (!Meteor.settings.public.analytics.enabled) return null
      return addAnalytics({ userId, ...data })
    }
  })
}

Analytics.methods.getAll = {
  name: 'analytics.methods.getAll',
  schema: {
    ids: {
      type: Array,
      optional: true
    },
    'ids.$': String,
    dependencies: {
      type: Array,
      optional: true
    },
    'dependencies.$': String
  },
  backend: true,
  run: onServer(async function ({ ids }) {
    const query = {}
    if (ids?.length > 0) {
      query._id = { $in: ids }
    }
    const all = await Analytics.collection().find(query).fetchAsync()

    return { [Analytics.name]: all }
  })
}
