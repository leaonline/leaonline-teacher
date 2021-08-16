# Schemas

## Course

```js
{
  title: {
    type: String
  },
  startsAt: {
    type: Date,
    optional: true
  },
  startedAt: {
    type: Date,
    optional: true
  },
  completesAt: {
    type: Date,
    optional: true
  },
  completedAt: {
    type: Date,
    optional: true
  },
  // example:
  // [ { _id: '6GU2ZHBR0827FS325', code: 'x0at2' , firstName: 'John', lastName: 'Doe' } ]
  users: {
    type: Array,
    optional: true
  },
  'users.$': {
    type: Object
  },
  'users.$._id': {
    type: String
  },
  'users.$.lastName': {
    type: String
  },
  'users.$.firstName': {
    type: String
  },
  'users.$.code': {
    type: String
  }
}
```

## User

```js

```

## CompetencyCategory

```js
{
  _id: {
    type: String
  },
  title: {
    type: String
  }
}
```

## Competency

```js
{
  _id: {
    type: String
  },
  title: {
    type: String
  },
  competencyCategory: {
    type: String,
    target: CompetencyCategory,
    optional: true
  },
  description: {
    type: String
  },
  help: {
    type: String
  },
  alphaLevel: {
    type: Number,
    target: AlphaLevel
    optional: true
  }
}
```

## AlphaLevel

```js
{
  _id: {
    type: String
  },
  title: {
    type: String
  },
  level: {
    type: Number,
    min: 1,
    max: 5
  }
}
```