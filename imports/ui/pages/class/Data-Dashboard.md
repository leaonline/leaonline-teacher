# Data for Dashboard

We use a one-dimensional input for the visualiation which has been processed from
the feedback data already.

## Data for Visualization

```js
[
  {
    // user
    userId: String,
    code: String,
    firstName: String?,
    lastName: String?,
    
    // test-refs
    sessionId: String,
    testCycle: String,
    
    // timestamps
    startedAt: Date,
    completedAt: Date,


    alphaLevels:  [{
      alphaLevelId: String,
      title: String,
      level: Number,
      percent: Number,
      grade: String,
      isGraded: Boolean
    }]
  }
]
```

### Example

```js
[
  {
    userId: '3976rf23gzvr2sf',
    code: 'X0AT2',
    firstName: 'Lotte',
    lastName: 'Scheller',
    
    sessionId: 'hgg379262r3vghse',
    testCycle: 'jhehgv32976ftugv',
    
    timestamp: '01.08.2021',
    
    alphaLevels:  [
      {
        alphaLevelId: 'KyFETESi4m7R4Wdfe',
        title: 'Alpha-Level 1',
        level: 1,
        percent: 0.875,
        grade: 'Erfüllt',
        isGraded: true
      },
      {
        alphaLevelId: 'CQPmhobPwxqeg9byz',
        title: 'Alpha-Level 2',
        level: 2,
        percent: 0.5552,
        grade: 'Teilweise Erfüllt',
        isGraded: true
      },
    ]
  }
]  
```
