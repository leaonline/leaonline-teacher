/* global Promise */
import { ReactiveVar } from 'meteor/reactive-var'

/**
 * BlazeBs4 utility to dynamically import a component or a list of components and save the result into
 * a {ReactiveVar} that can be used to determine the loading status.
 * If any error occurs during the load, it will also be saved into a {ReactiveVar}
 *
 * @param components A single BlazeBs4 component or a list (Array) of components.
 * @return {{loaded, errors}} An Object containing a {loaded} and an {error} property, both {ReactiveVar} instances.
 */

export const bbsComponentLoader = components => {
  const loaded = new ReactiveVar()
  const errors = new ReactiveVar()
  const list = Array.isArray(components)
    ? components
    : [components]

  Promise.all(list)
    .then(() => loaded.set(true))
    .catch(e => errors.set(e))

  return { loaded, errors }
}
