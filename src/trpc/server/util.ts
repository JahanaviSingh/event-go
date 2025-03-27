import { prisma } from '@/db/prisma'
import { Role } from '../../util/types'
import { TRPCError } from '@trpc/server'

export const getUserRoles = async (id: string): Promise<Role[]> => {
  const [adminExists, managerExits] = await Promise.all([
    prisma.admin.findUnique({ where: { id } }),
    prisma.manager.findUnique({ where: { id } }),
  ])

  const roles: Role[] = []
  if (adminExists) roles.push('admin')
  if (managerExits) roles.push('manager')

  return roles
}

export const authorizeUser = async (
  userId: string,
  roles: Role[],
): Promise<void> => {
  if (!roles || roles.length === 0) {
    return // No specific roles required, access is granted
  }

  const userRoles = await getUserRoles(userId)

  if (!userRoles.some((role) => roles.includes(role))) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'User does not have the required role(s).',
    })
  }
}
