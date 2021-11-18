export const username = user => [
  user?.services?.lea?.firstName,
  user?.services?.lea?.lastName,
].join(' ')
