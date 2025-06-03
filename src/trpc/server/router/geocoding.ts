import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '..'
import { TRPCError } from '@trpc/server'
import { prisma } from '../../../../src/server/db'

const universityQuery = `
[out:json][timeout:25];
area["name:en"="India"]->.india;
(
  node["amenity"="university"](area.india);
  way["amenity"="university"](area.india);
  relation["amenity"="university"](area.india);
);
out body;
>;
out skel qt;
`

export const geocodingRouter = createTRPCRouter({
  reverseGeocode: publicProcedure
    .input(
      z.object({
        lat: z.number(),
        lng: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { lat, lng } = input
      console.log('Geocoding service received coordinates:', { lat, lng })
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en-US,en;q=0.9',
              'User-Agent': 'EventGo/1.0'
            }
          }
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch address')
        }

        const data = await response.json()
        
        return {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lon),
          formattedAddress: data.display_name,
        }
      } catch (error) {
        console.error('Error in reverse geocoding:', error)
        throw error
      }
    }),

  searchUniversities: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      console.log('[searchUniversities] Starting search with input:', input)

      try {
        // First try database search
        console.log('[searchUniversities] Searching database...')
        const dbUniversities = await prisma.university.findMany({
          where: input.name ? {
            name: { contains: input.name, mode: 'insensitive' }
          } : {},
        })
        console.log('[searchUniversities] Database search found:', dbUniversities.length, 'universities')

        if (dbUniversities.length > 0) {
          console.log('[searchUniversities] Returning database results:', dbUniversities)
          return dbUniversities
        }

        // If no database results, try Overpass API with a simpler query
        console.log('[searchUniversities] No database results, querying Overpass API...')
        
        // Simplified query that just looks for universities in India
        const query = `
          [out:json][timeout:25];
          area["name:en"="India"]->.searchArea;
          (
            node["amenity"="university"](area.searchArea);
          );
          out body;
          >;
          out skel qt;
        `

        console.log('[searchUniversities] Using simplified Overpass API query:', query)

        // Try only the most reliable endpoint first
        const endpoint = 'https://overpass-api.de/api/interpreter'
        
        try {
          console.log(`[searchUniversities] Trying endpoint: ${endpoint}`)
          
          const formData = new URLSearchParams()
          formData.append('data', query)
          
          const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'User-Agent': 'EventGo/1.0'
            },
            signal: AbortSignal.timeout(30000), // 30 second timeout
          })

          console.log(`[searchUniversities] Response status:`, response.status)
          console.log(`[searchUniversities] Response headers:`, Object.fromEntries(response.headers.entries()))

          if (!response.ok) {
            const errorText = await response.text()
            console.error(`[searchUniversities] API Error:`, {
              status: response.status,
              statusText: response.statusText,
              error: errorText
            })
            throw new Error(`HTTP ${response.status}: ${errorText}`)
          }

          const data = await response.json()
          console.log(`[searchUniversities] Raw API response:`, data)
          
          if (!data || !Array.isArray(data.elements)) {
            console.error(`[searchUniversities] Invalid response format:`, data)
            throw new Error('Invalid response format from Overpass API')
          }

          console.log(`[searchUniversities] Found ${data.elements.length} universities`)
          
          // Process and filter the results
          const universities = data.elements
            .filter((element: any) => {
              const hasName = element.tags && element.tags.name
              const hasLocation = element.lat && element.lon
              if (!hasName || !hasLocation) {
                console.log(`[searchUniversities] Filtered out university:`, element)
              }
              return hasName && hasLocation
            })
            .map((element: any) => {
              const tags = element.tags || {}
              return {
                id: element.id.toString(),
                name: tags.name,
                city: tags['addr:city'] || tags['addr:suburb'] || '',
                state: tags['addr:state'] || '',
                website: tags.website || '',
                lat: element.lat,
                lng: element.lon,
                address: {
                  street: tags['addr:street'] || '',
                  city: tags['addr:city'] || tags['addr:suburb'] || '',
                  state: tags['addr:state'] || '',
                  country: tags['addr:country'] || 'India',
                  postalCode: tags['addr:postcode'] || '',
                },
                auditoriums: []
              }
            })

          console.log(`[searchUniversities] Processed ${universities.length} universities:`, universities)

          // Store in database
          for (const uni of universities) {
            try {
              await prisma.university.upsert({
                where: { id: uni.id },
                update: {
                  name: uni.name,
                  city: uni.city,
                  state: uni.state,
                  website: uni.website,
                  lat: uni.lat,
                  lng: uni.lng,
                },
                create: {
                  id: uni.id,
                  name: uni.name,
                  city: uni.city,
                  state: uni.state,
                  website: uni.website,
                  lat: uni.lat,
                  lng: uni.lng,
                },
              })
            } catch (dbError) {
              console.error('[searchUniversities] Database error for university:', {
                id: uni.id,
                error: dbError,
                university: uni
              })
            }
          }

          return universities

        } catch (error) {
          console.error('[searchUniversities] Overpass API request failed:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          })
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch universities. Please try again in a few moments.',
            cause: error
          })
        }

      } catch (error) {
        console.error('[searchUniversities] Detailed error:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          input
        })
        
        if (error instanceof TRPCError) {
          throw error
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch universities',
          cause: error
        })
      }
    }),

  searchNearbyAuditoriums: publicProcedure
    .input(
      z.object({
        lat: z.number(),
        lng: z.number(),
        radius: z.number().default(1000), // radius in meters, default 1km
      })
    )
    .query(async ({ input }) => {
      try {
        const { lat, lng, radius } = input
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="cinema"](around:${radius},${lat},${lng});
            node["amenity"="theatre"](around:${radius},${lat},${lng});
            node["building"="cinema"](around:${radius},${lat},${lng});
            node["building"="theatre"](around:${radius},${lat},${lng});
          );
          out body;
          >;
          out skel qt;
        `

        const response = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `data=${encodeURIComponent(query)}`,
        })

        if (!response.ok) {
          throw new Error('Failed to fetch nearby auditoriums')
        }

        const data = await response.json()
        const auditoriums = data.elements
          .filter((element: any) => element.type === 'node')
          .map((element: any) => ({
            id: element.id,
            name: element.tags.name || 'Unknown Auditorium',
            lat: element.lat,
            lng: element.lon,
            type: element.tags.amenity || element.tags.building,
            address: element.tags['addr:full'] || element.tags['addr:street'] || 'Address not available',
            website: element.tags.website || null,
            phone: element.tags.phone || null,
            openingHours: element.tags['opening_hours'] || null,
          }))

        return auditoriums
      } catch (error) {
        console.error('Error in nearby auditoriums search:', error)
        throw error
      }
    }),

  getCoordinates: publicProcedure
    .input(
      z.object({
        city: z.string(),
      })
    )
    .query(async ({ input }) => {
      console.log('Getting coordinates for city:', input.city)
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input.city)}&limit=1`,
          {
            headers: {
              'Accept-Language': 'en-US,en;q=0.9',
              'User-Agent': 'EventGo/1.0'
            }
          }
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch coordinates')
        }

        const data = await response.json()
        
        if (!data || data.length === 0) {
          console.log('No coordinates found for city:', input.city)
          return null
        }

        const result = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          formattedAddress: data[0].display_name,
        }

        console.log('Found coordinates:', result)
        return result
      } catch (error) {
        console.error('Error in getCoordinates:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get coordinates for city',
          cause: error
        })
      }
    }),
}) 