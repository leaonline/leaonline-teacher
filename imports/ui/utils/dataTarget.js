export const dataTarget = (event, name = 'target') => event.target.getAttribute(`data-${name}`) || event.currentTarget.getAttribute(`data-${name}`)
