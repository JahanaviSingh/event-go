import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a User (for Admin, Manager, etc.)
  const user = await prisma.user.create({
    data: {
      id: 'user1', // Example user ID
      name: 'John Doe',
      image: 'https://example.com/profile.jpg',
    },
  })

  // Create an Admin linked to the User
  const admin = await prisma.admin.create({
    data: {
      id: user.id, // Link the user to admin
    },
  })

  // Create an Auditorium
  const auditorium = await prisma.auditorium.create({
    data: {
      name: 'Main Auditorium',
    },
  })

  // Create a Screen linked to the Auditorium
  const screen = await prisma.screen.create({
    data: {
      number: 1,
      AuditoriumId: auditorium.id,
      price: 150,
    },
  })

  // Create a Showtime for a Movie/Event
  const show = await prisma.show.create({
    data: {
      title: 'Sample Event',
      genre: 'LECTURE',
      organizer: 'John Doe',
      duration: 120, // minutes
      releaseDate: new Date('2025-04-27T00:00:00.000Z'),
    },
  })

  // Create Showtime entry
  const showtime = await prisma.showtime.create({
    data: {
      startTime: new Date('2025-04-27T10:00:00.000Z'),
      showId: show.id,
      screenId: screen.id,
    },
  })

  // Create a Seat for the Screen
  const seat = await prisma.seat.create({
    data: {
      row: 1,
      column: 1,
      screenId: screen.id,
    },
  })

  // Create a Booking for a Seat
  const ticket = await prisma.ticket.create({
    data: {
      uid: user.id,
      qrCode: 'SAMPLE_QR_CODE',
    },
  })

  

  console.log('Dummy data inserted successfully!')
}

// Execute the main function and handle errors
main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
