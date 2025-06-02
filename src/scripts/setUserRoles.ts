import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setUserRoles() {
  const userId = 'user_2uRFCvAl8o4Ge1m07Pyl8EenRpR'

  try {
    // Create Admin role
    await prisma.admin.create({
      data: {
        id: userId,
      },
    })

    // Create Manager role
    await prisma.manager.create({
      data: {
        id: userId,
      },
    })

    console.log('Successfully set user roles as admin and manager')
  } catch (error) {
    console.error('Error setting user roles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setUserRoles() 