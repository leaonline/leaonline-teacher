export const loadDynamic = (asyncFn, { onError = () => {}} = {}) => {
  const loaded = new ReactiveVar(false)

  asyncFn()
    .catch(onError)
    .finally(() => loaded.set(true))
  return loaded
}