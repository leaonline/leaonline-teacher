import { onServer } from '../../utils/arch'

export const Legal = {
  name: 'legal',
  label: 'legal.title',
  icon: 'info',
  isConfigDoc: true
}

Legal.schema = {
  imprint: {
    type: String,
    label: 'legal.imprint',
    richText: true,
    optional: true
  },
  privacy: {
    type: String,
    label: 'legal.privacy',
    richText: true,
    optional: true
  },
  terms: {
    type: String,
    label: 'legal.terms',
    richText: true,
    optional: true
  },
  contact: {
    type: String,
    label: 'legal.contact',
    richText: true,
    optional: true
  }
}

Legal.helpers = {}

Legal.helpers.init = async function () {
  const configDoc = await Legal.collection().findOneAsync()
  if (!configDoc) {
    await Legal.collection().insertAsync({
      imprint: 'Imprint',
      privacy: 'Privacy',
      terms: 'Terms',
      contact: 'Contact'
    })
  }
}

Legal.methods = {}

Legal.methods.update = {
  name: 'legal.methods.update',
  backend: true,
  schema: {
    _id: {
      type: String
    },
    imprint: Legal.schema.imprint,
    privacy: Legal.schema.privacy,
    terms: Legal.schema.terms,
    contact: Legal.schema.contact
  },
  run: onServer(async function ({ _id, imprint, privacy, terms, contact }) {
    return Legal.collection().updateAsync(_id, { $set: { imprint, privacy, terms, contact } })
  })
}

Legal.methods.get = {
  name: 'legal.methods.get',
  isPublic: true,
  schema: {
    _id: {
      type: String,
      optional: true
    },
    name: {
      type: String,
      optional: true,
      allowedValues: Object.keys(Legal.schema)
    }
  },
  run: onServer(async function ({ name } = {}) {
    const config = await Legal.collection().findOneAsync()
    if (!name) {
      return config
    }
    else {
      return config && config[name]
    }
  })
}

Legal.publications = {}
