export const ContextRegistry = {}

const contexts = new Map()

ContextRegistry.add = (name, ctx) => contexts.set(name, ctx)

ContextRegistry.get = name => contexts.get(name)
