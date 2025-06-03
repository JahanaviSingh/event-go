# Event-Go Technical Documentation

## Table of Contents
1. [Project Architecture](#project-architecture)
2. [Core Files and Functions](#core-files-and-functions)
3. [Data Flow](#data-flow)
4. [Component Relationships](#component-relationships)
5. [API Integration](#api-integration)
6. [State Management](#state-management)
7. [Database Interactions](#database-interactions)

## Project Architecture

### Frontend Architecture
```
src/
├── app/                    # Next.js app router pages
│   ├── auditoriums/       # Auditorium-related pages
│   ├── shows/            # Show-related pages
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
│   ├── atoms/           # Basic UI components
│   ├── molecules/       # Composite components
│   └── templates/       # Page templates
└── trpc/                # API client setup
```

### Backend Architecture
```
src/
├── server/
│   ├── router/          # tRPC routers
│   ├── middleware/      # Custom middleware
│   └── utils/          # Server utilities
└── trpc/
    └── clients/        # tRPC client setup
```

## Core Files and Functions

### 1. Auditorium Page (`src/app/auditoriums/[city]/page.tsx`)
```typescript
// Main Functions
- AuditoriumsPage: Main component for city-specific auditorium view
- handleBookNow: Handles show booking initiation
- useGeocoding: Fetches city coordinates
- useShows: Fetches shows for the city
```

#### Key Features:
- City-based show filtering
- Category-based show browsing
- Show booking flow
- Location-based recommendations

### 2. Shows Router (`src/trpc/server/router/shows.ts`)
```typescript
// Main Functions
- shows: Main query for fetching shows
- filterShowsByCity: Filters shows by city
- filterShowsByCoordinates: Filters shows by location
```

#### Key Features:
- Show filtering by city
- Show filtering by coordinates
- Showtime management
- Auditorium association

### 3. Booking Components (`src/components/templates/SearchAuditorium.tsx`)
```typescript
// Main Functions
- BookingStepper: Multi-step booking process
- handleSeatSelection: Manages seat selection
- handlePayment: Processes payment
```

#### Key Features:
- Step-by-step booking flow
- Seat selection interface
- Payment processing
- Booking confirmation

## Data Flow

### 1. Show Discovery Flow
```mermaid
graph TD
    A[User visits city page] --> B[Fetch city coordinates]
    B --> C[Query shows with coordinates]
    C --> D[Filter shows by city]
    D --> E[Display matching shows]
    D --> F[Display all shows]
```

### 2. Booking Flow
```mermaid
graph TD
    A[User clicks Book Now] --> B[Open booking dialog]
    B --> C[Select showtime]
    C --> D[Choose seats]
    D --> E[Process payment]
    E --> F[Generate ticket]
```

## Component Relationships

### 1. Show Display Components
```
AuditoriumsPage
├── ShowCard
│   ├── ShowImage
│   ├── ShowDetails
│   └── BookNowButton
└── CategoryFilter
    └── CategoryButton
```

### 2. Booking Components
```
BookingStepper
├── ShowtimeSelector
├── SeatLayout
├── PaymentForm
└── TicketDisplay
```

## API Integration

### 1. tRPC Endpoints
```typescript
// Shows API
shows.shows
- Input: { lat?: number, lng?: number, city?: string }
- Output: { matchingShows: Show[], allShows: Show[] }

// Showtimes API
showtimes.showtimes
- Input: { where: { Show?: { id: number } } }
- Output: Showtime[]
```

### 2. External APIs
```typescript
// Geocoding API
geocoding.getCoordinates
- Input: { city: string }
- Output: { lat: number, lng: number }

// Payment API
payment.process
- Input: { amount: number, currency: string }
- Output: { success: boolean, transactionId: string }
```

## State Management

### 1. Redux Store
```typescript
interface RootState {
  shows: {
    selectedShowId: number | null
    selectedScreenId: number | null
    selectedShowtimeId: number | null
    selectedSeats: Seat[]
  }
  booking: {
    step: number
    paymentStatus: 'pending' | 'success' | 'failed'
  }
}
```

### 2. Local State
```typescript
// AuditoriumsPage
const [selectedCategory, setSelectedCategory] = useState<Genre>(Genre.CULTURAL)
const [selectedShow, setSelectedShow] = useState<Show | null>(null)
const [isDialogOpen, setIsDialogOpen] = useState(false)
```

## Database Interactions

### 1. Show Queries
```typescript
// Fetch shows with filters
const shows = await prisma.show.findMany({
  where: {
    Showtimes: {
      some: {
        Screen: {
          Auditorium: {
            Address: {
              address: { contains: city }
            }
          }
        }
      }
    }
  },
  include: {
    Showtimes: {
      include: {
        Screen: {
          include: {
            Auditorium: {
              include: {
                Address: true
              }
            }
          }
        }
      }
    }
  }
})
```

### 2. Booking Queries
```typescript
// Create booking
const booking = await prisma.booking.create({
  data: {
    userId: user.id,
    showtimeId: showtime.id,
    seats: selectedSeats,
    status: 'CONFIRMED'
  }
})
```

## Error Handling

### 1. API Error Handling
```typescript
try {
  const result = await trpcClient.shows.shows.query({
    lat,
    lng,
    city
  })
} catch (error) {
  toast.error('Failed to fetch shows')
  console.error('Shows query error:', error)
}
```

### 2. Form Validation
```typescript
const schema = z.object({
  showtimeId: z.number(),
  seats: z.array(z.object({
    row: z.number(),
    column: z.number()
  }))
})
```

## Performance Optimizations

### 1. Data Fetching
- Implemented query caching
- Used pagination for large datasets
- Optimized database queries with proper indexing

### 2. UI Performance
- Implemented lazy loading for images
- Used React.memo for expensive components
- Optimized re-renders with proper state management

## Security Measures

### 1. Authentication
- Implemented Clerk authentication
- Protected routes with middleware
- Secured API endpoints

### 2. Data Protection
- Encrypted sensitive data
- Implemented rate limiting
- Added input validation

## Testing Strategy

### 1. Unit Tests
```typescript
describe('Show filtering', () => {
  it('should filter shows by city', () => {
    const result = filterShowsByCity(shows, 'Mumbai')
    expect(result.length).toBeGreaterThan(0)
  })
})
```

### 2. Integration Tests
```typescript
describe('Booking flow', () => {
  it('should complete booking process', async () => {
    // Test booking flow
  })
})
```

## Deployment Configuration

### 1. Docker Setup
```yaml
services:
  app:
    build: .
    environment:
      DATABASE_URL: ${DATABASE_URL}
      NEXT_PUBLIC_CLERK_KEY: ${CLERK_KEY}
```

### 2. Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/eventgo
NEXT_PUBLIC_CLERK_KEY=your_clerk_key
```

## Monitoring and Logging

### 1. Error Tracking
```typescript
// Global error handler
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', { message, source, lineno, colno, error })
}
```

### 2. Performance Monitoring
```typescript
// Performance metrics
const metrics = {
  pageLoad: performance.now(),
  apiCalls: 0,
  renderTime: 0
}
```

## Conclusion
This technical documentation provides a comprehensive overview of the Event-Go project's architecture, components, and their interactions. The system is built with scalability, maintainability, and user experience in mind, using modern web technologies and best practices. 