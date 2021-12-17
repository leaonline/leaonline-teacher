export const arrayToQueryParams = function (array) {
  const params = []

  for (let i = 0; i < array.length - 1; i += 2) {
    const key = array[i]
    const value = array[i + 1]
    params.push(`${key}=${encodeURIComponent(value)}`)
  }

  return params.join('&')
}
