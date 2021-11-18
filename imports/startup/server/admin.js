import { Admin } from '../../contexts/admin/Admin'
import { createMethods } from '../../infrastructure/factories/method/createMethods'
import { rateLimitMethods } from '../../infrastructure/factories/ratelimit/rateLimit'

const methods = Object.values(Admin.methods)
createMethods(methods)
rateLimitMethods(methods)
