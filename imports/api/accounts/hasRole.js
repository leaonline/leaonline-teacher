export const hasRole = (user, role) => (user?.services?.lea?.roles || []).includes(role)
