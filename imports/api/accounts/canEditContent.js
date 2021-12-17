import { Meteor } from 'meteor/meteor'
import { hasRole } from './hasRole'

const contentRole = Meteor.settings.public.hosts.content.role

export const canEditContent = (user) => hasRole(user, contentRole)
