import { protectedProcedure } from '@/trpc/server'
import { createTRPCRouter, publicProcedure } from '@/trpc/server'
import { schemaCreateShows } from '@/schema/showSchema'
import { put } from '@vercel/blob'
import { z } from 'zod'
import { Show, Showtime, Screen, Auditorium, Address } from '@prisma/client'

type ShowWithRelations = Show & {
  Showtimes: (Showtime & {
    Screen:
      | (Screen & {
          Auditorium:
            | (Auditorium & {
                Address: Address | null
              })
            | null
        })
      | null
  })[]
}

type ShowsResponse = {
  matchingShows: ShowWithRelations[]
  allShows: ShowWithRelations[]
  hasNearbyShows: boolean
}

export const showsRouter = createTRPCRouter({
  shows: publicProcedure
    .input(
      z
        .object({
          lat: z.number().optional(),
          lng: z.number().optional(),
          city: z.string().optional(),
          id: z.number().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }): Promise<ShowsResponse> => {
      console.log('=== Shows Query Debug ===')
      console.log('Input:', input)

      // If ID is provided, get specific show
      if (input?.id) {
        const show = await ctx.db.show.findUnique({
          where: { id: input.id },
          include: {
            Showtimes: {
              include: {
                Screen: {
                  include: {
                    Auditorium: {
                      include: {
                        Address: true,
                      },
                    },
                  },
                },
              },
            },
          },
        })
        return {
          matchingShows: show ? [show] : [],
          allShows: show ? [show] : [],
          hasNearbyShows: true,
        }
      }

      // First get all shows that have showtimes
      const allShows = (await ctx.db.show.findMany({
        where: {
          Showtimes: {
            some: {
              Screen: {
                Auditorium: {
                  isNot: undefined,
                },
              },
            },
          },
        },
        include: {
          Showtimes: {
            include: {
              Screen: {
                include: {
                  Auditorium: {
                    include: {
                      Address: true,
                    },
                  },
                },
              },
            },
          },
        },
      })) as ShowWithRelations[]

      console.log('=== All Shows Found ===')
      console.log('Total shows:', allShows.length)
      allShows.forEach((show) => {
        console.log(`\nShow: ${show.title}`)
        show.Showtimes.forEach((st) => {
          const auditorium = st.Screen?.Auditorium
          const address = auditorium?.Address
          console.log(`- Showtime: ${st.id}`)
          console.log(`  Screen: ${st.Screen?.number}`)
          console.log(`  Auditorium: ${auditorium?.name}`)
          console.log(`  Address: ${address?.address}`)
          console.log(`  Coordinates: ${address?.lat}, ${address?.lng}`)
        })
      })

      // If no filters, return all shows with showtimes
      if (!input?.lat && !input?.lng && !input?.city) {
        console.log('No filters provided, returning all shows')
        return {
          matchingShows: allShows,
          allShows: allShows,
          hasNearbyShows: true,
        }
      }

      // Filter shows based on input
      console.log('\n=== Filtering Shows ===')
      console.log('Filtering with coordinates:', {
        lat: input?.lat,
        lng: input?.lng,
      })
      console.log('Filtering with city:', input?.city)

      const matchingShows = allShows.filter((show) => {
        console.log(`\nChecking show: ${show.title}`)
        // Check if any showtime matches the filters
        const hasMatchingShowtime = show.Showtimes.some((showtime) => {
          if (!showtime.Screen?.Auditorium) {
            console.log(`- Showtime ${showtime.id} has no Screen or Auditorium`)
            return false
          }

          const auditorium = showtime.Screen.Auditorium
          const address = auditorium.Address

          // Skip if no address
          if (!address) {
            console.log(`- Auditorium ${auditorium.name} has no address`)
            return false
          }

          let matches = true

          // Filter by coordinates (within ~10km radius)
          if (input?.lat && input?.lng) {
            const distance = Math.sqrt(
              Math.pow(address.lat - input.lat, 2) +
                Math.pow(address.lng - input.lng, 2),
            )
            const isWithinRadius = distance <= 1 // ~100km radius
            console.log(`- Distance check for ${auditorium.name}:`)
            console.log(`  Search coordinates: ${input.lat}, ${input.lng}`)
            console.log(
              `  Auditorium coordinates: ${address.lat}, ${address.lng}`,
            )
            console.log(`  Distance: ${distance}`)
            console.log(`  Within radius: ${isWithinRadius}`)
            if (!isWithinRadius) {
              matches = false
            }
          }

          // Filter by city name in address
          // if (input?.city && matches) {
          //   const cityMatch = address.address.toLowerCase().includes(input.city.toLowerCase())
          //   console.log(`- City check for ${auditorium.name}:`)
          //   console.log(`  Search city: ${input.city}`)
          //   console.log(`  Address: ${address.address}`)
          //   console.log(`  Matches: ${cityMatch}`)
          //   if (!cityMatch) {
          //     matches = false
          //   }
          // }

          if (matches) {
            console.log(`✓ Showtime ${showtime.id} matches all filters`)
          }

          return matches
        })

        if (hasMatchingShowtime) {
          console.log(`✓ Show ${show.title} has matching showtimes`)
        } else {
          console.log(`✗ Show ${show.title} has no matching showtimes`)
        }

        return hasMatchingShowtime
      })

      console.log('\n=== Filtered Results ===')
      console.log('Matching shows count:', matchingShows.length)
      matchingShows.forEach((show) => {
        console.log(`\nShow: ${show.title}`)
        show.Showtimes.forEach((st) => {
          const auditorium = st.Screen?.Auditorium
          const address = auditorium?.Address
          console.log(`- Showtime: ${st.id}`)
          console.log(`  Screen: ${st.Screen?.number}`)
          console.log(`  Auditorium: ${auditorium?.name}`)
          console.log(`  Address: ${address?.address}`)
          console.log(`  Coordinates: ${address?.lat}, ${address?.lng}`)
        })
      })

      return {
        matchingShows: matchingShows,
        allShows: allShows,
        hasNearbyShows: matchingShows.length > 0,
      }
    }),
  createShow: protectedProcedure('admin')
    .input(schemaCreateShows)
    .mutation(async ({ ctx, input }) => {
      console.log(input)

      const { showtimes, releaseDate, screenId, posterUrl, ...rest } = input

      return ctx.db.show.create({
        data: {
          ...rest,
          releaseDate: new Date(releaseDate),
          posterUrl: posterUrl || null,
          Showtimes: {
            create: showtimes.map(({ startTime }) => ({
              startTime: new Date(`${releaseDate}T${startTime}Z`),
              screenId,
            })),
          },
        },
      })
    }),
})
