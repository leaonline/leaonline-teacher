export const getUserName = (user, { alwaysIncludeCode = false } = {}) => {
  if (!user.firstName && !user.lastName) {
    return user.account.code
  }

  let name = `${user.firstName} ${user.lastName}`

  if (alwaysIncludeCode) {
    name += `- ${user.account.code}`
  }

  return name
}
