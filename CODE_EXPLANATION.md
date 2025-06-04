# Event-Go Code Explanation

## Table of Contents
1. [Auditorium Page Component](#auditorium-page-component)
2. [State Management](#state-management)
3. [API Integration](#api-integration)
4. [UI Components](#ui-components)
5. [Event Handlers](#event-handlers)
6. [Error Handling](#error-handling)

## Auditorium Page Component

### Component Declaration and Props
```typescript
interface AuditoriumsPageProps {
  params: Promise<{
    city: string
  }>
}
```
- Defines the component's props interface
- Expects a Promise containing city parameter from URL

### Category Definitions
```typescript
const categories = [
  { id: Genre.CULTURAL, name: 'Cultural', icon: '🎭' },
  { id: Genre.CONFERENCE, name: 'Conference', icon: '🎤' },
  // ... other categories
]
```
- Defines available show categories
- Each category has an ID, name, and icon
- Used for filtering shows by type

## State Management

### Location State
```typescript
const [lat, setLat] = useState<number | null>(null)
const [lng, setLng] = useState<number | null>(null)
const [cityName, setCityName] = useState(decodeURIComponent(resolvedParams.city))
```
- Manages geographical coordinates
- Stores city name from URL parameters
- Used for location-based show filtering

### UI State
```typescript
const [selectedCategory, setSelectedCategory] = useState<Genre>(Genre.CULTURAL)
const [selectedShow, setSelectedShow] = useState<Show | null>(null)
const [isDialogOpen, setIsDialogOpen] = useState(false)
```
- Tracks selected show category
- Manages selected show for booking
- Controls booking dialog visibility

## API Integration

### Geocoding Query
```typescript
const { data: coordinates, error: geocodingError, isLoading: isGeocodingLoading } = 
  trpcClient.geocoding.getCoordinates.useQuery(
    { city: cityName },
    {
      onSuccess: (data) => {
        if (data) {
          setLat(data.lat)
          setLng(data.lng)
        }
      },
      onError: (error) => {
        toast.error('Could not find location coordinates')
      }
    }
  )
```
- Fetches city coordinates using tRPC
- Updates location state on success
- Shows error toast on failure

### Shows Query
```typescript
const { data: showsData, isLoading: isShowsLoading, error: showsError } = 
  trpcClient.shows.shows.useQuery(
    {
      lat: lat ?? undefined,
      lng: lng ?? undefined,
      city: cityName
    },
    {
      enabled: !!cityName,
      onSuccess: (data) => {
        // Log show data
      }
    }
  )
```
- Fetches shows based on location
- Only runs when city name is available
- Returns matching and all shows

## UI Components

### Hero Section
```typescript
<div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12">
  <div className="container mx-auto px-4">
    <h1 className="text-4xl font-bold mb-2">Shows in {cityName}</h1>
    <p className="text-lg opacity-90">Discover the best shows happening in your city</p>
  </div>
</div>
```
- Displays city name and description
- Uses gradient background
- Responsive container layout

### Category Filter
```typescript
<div className="flex gap-4 overflow-x-auto pb-4">
  {categories.map((category) => (
    <button
      key={category.id}
      onClick={() => setSelectedCategory(category.id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full ${
        selectedCategory === category.id
          ? 'bg-primary text-white'
          : 'bg-white text-gray-700'
      }`}
    >
      <span className="text-xl">{category.icon}</span>
      <span>{category.name}</span>
    </button>
  ))}
</div>
```
- Horizontal scrollable category list
- Active category highlighting
- Icon and name display

### Show Cards
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {matchingShows.map((show) => (
    <Link
      key={show.id}
      href={`/shows/${show.id}`}
      className="block bg-white rounded-lg shadow-md"
    >
      <div className="relative h-48">
        <Image
          src={show.posterUrl || '/film.png'}
          alt={show.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{show.title}</h3>
        {/* Show details */}
      </div>
    </Link>
  ))}
</div>
```
- Responsive grid layout
- Show poster image
- Show details display
- Link to show details page

## Event Handlers

### Booking Handler
```typescript
const handleBookNow = (show: typeof selectedShow) => {
  setSelectedShow(show)
  if (!showtimes || showtimes.length === 0) {
    toast.error('No showtimes available for this show')
    return
  }
  setIsDialogOpen(true)
}
```
- Sets selected show
- Checks showtime availability
- Opens booking dialog
- Shows error if no showtimes

### Category Selection
```typescript
onClick={() => setSelectedCategory(category.id)}
```
- Updates selected category
- Triggers show filtering
- Updates UI state

## Error Handling

### Loading States
```typescript
if (isGeocodingLoading || isShowsLoading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader className="w-8 h-8" />
    </div>
  )
}
```
- Shows loading spinner
- Centers on screen
- Prevents content flash

### Error States
```typescript
if (geocodingError) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Finding Location</h1>
          <p className="text-gray-600 mb-8">
            We couldn't find the coordinates for {cityName}
          </p>
          <Button onClick={() => router.push('/')} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
```
- Displays error message
- Provides navigation option
- Maintains consistent styling

## Component Connections

### Data Flow
1. URL Parameters → City Name
2. City Name → Geocoding Query
3. Coordinates → Shows Query
4. Shows Data → UI Rendering
5. User Interaction → State Updates
6. State Updates → UI Updates

### Component Hierarchy
```
AuditoriumsPage
├── Hero Section
├── Category Filter
├── Shows in City
│   └── Show Cards
├── All Shows
│   └── Show Cards
└── Booking Dialog
    └── BookingStepper
```

## Performance Considerations

### Image Optimization
```typescript
<Image
  src={show.posterUrl || '/film.png'}
  alt={show.title}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
  className="object-cover"
/>
```
- Uses Next.js Image component
- Responsive image sizing
- Fallback image handling

### Query Optimization
```typescript
{
  enabled: !!cityName,
  onSuccess: (data) => {
    // Log data
  }
}
```
- Conditional query execution
- Success callback handling
- Error handling

## Security Measures

### Input Validation
```typescript
const cityName = decodeURIComponent(resolvedParams.city)
```
- URL parameter decoding
- Prevents XSS attacks
- Safe string handling

### Error Boundaries
```typescript
try {
  // API calls
} catch (error) {
  toast.error('Error message')
  console.error('Detailed error:', error)
}
```
- Try-catch blocks
- User-friendly error messages
- Error logging

## Accessibility

### ARIA Labels
```typescript
<DialogContent
  className="max-w-3xl"
  aria-describedby="booking-dialog-description"
>
```
- Dialog accessibility
- Screen reader support
- Keyboard navigation

### Semantic HTML
```typescript
<h1 className="text-4xl font-bold mb-2">Shows in {cityName}</h1>
<p className="text-lg opacity-90">Discover the best shows...</p>
```
- Proper heading hierarchy
- Descriptive text
- Semantic structure

## Conclusion
This code explanation provides a detailed breakdown of the Auditorium Page component, its functionality, and the connections between different parts of the code. The component is designed to be maintainable, performant, and accessible while providing a rich user experience for show discovery and booking. 