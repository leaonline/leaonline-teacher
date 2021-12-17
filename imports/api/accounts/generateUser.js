import { OtuLea } from '../remotes/OtuLea'

export const generateUser = () => OtuLea.generateUser()

export const userExists = ({ code }) => OtuLea.userExists({ code })
