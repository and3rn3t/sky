import { CelestialEvent, UserLocation } from './types'
import { fetchNASAEvents } from './nasaApi'

export async function getUserLocation(): Promise<UserLocation | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${location.latitude}&lon=${location.longitude}&format=json`
          )
          const data = await response.json()
          location.city = data.address?.city || data.address?.town || data.address?.village
          location.region = data.address?.state || data.address?.country
        } catch (error) {
          console.error('Error fetching location name:', error)
        }

        resolve(location)
      },
      () => {
        resolve(null)
      }
    )
  })
}

export async function generateCelestialEvents(location: UserLocation): Promise<CelestialEvent[]> {
  try {
    const events = await fetchNASAEvents(location)
    
    if (events.length === 0) {
      return getFallbackEvents()
    }
    
    return events
  } catch (error) {
    console.error('Error generating celestial events:', error)
    return getFallbackEvents()
  }
}

function getFallbackEvents(): CelestialEvent[] {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return [
    {
      id: 'moon-phase-today',
      name: 'Current Moon Phase',
      type: 'moon_phase',
      date: today.toISOString(),
      description: 'Observe the current phase of our closest celestial neighbor.',
      educationalContent: 'The Moon goes through phases as it orbits Earth, taking about 29.5 days to complete one cycle. These phases result from the changing angle between the Sun, Moon, and Earth, which affects how much of the Moon\'s illuminated surface we can see from Earth.',
      viewingTips: 'The Moon is visible with the naked eye. Best viewing is away from bright lights. Use binoculars or a telescope to see surface details like craters and maria.',
      bestViewingTime: 'Evening after sunset',
      visibilityScore: 95,
      isVisibleNow: false,
      nextVisibleIn: 'Tonight after sunset',
      rarity: 'common',
      requiredEquipment: 'Naked eye',
    },
    {
      id: 'jupiter-viewing',
      name: 'Jupiter',
      type: 'planet',
      date: today.toISOString(),
      description: 'The largest planet in our solar system is visible tonight.',
      educationalContent: 'Jupiter is a gas giant and the fifth planet from the Sun. It\'s so large that all the other planets in the solar system could fit inside it. Jupiter has a distinctive feature called the Great Red Spot, a massive storm that has been raging for hundreds of years.',
      viewingTips: 'Look for the brightest "star" in the sky. Jupiter appears as a bright, steady light. With binoculars, you can see its four largest moons. A telescope reveals cloud bands and the Great Red Spot.',
      bestViewingTime: 'Evening, 8 PM - 2 AM',
      visibilityScore: 85,
      isVisibleNow: false,
      nextVisibleIn: 'in 5 hours',
      rarity: 'common',
      requiredEquipment: 'Naked eye (binoculars enhance viewing)',
    },
  ]
}

export function isEventVisibleNow(event: CelestialEvent): boolean {
  return event.isVisibleNow
}

export function getEventsByTimeframe(
  events: CelestialEvent[],
  timeframe: 'tonight' | 'week' | 'month'
): CelestialEvent[] {
  const now = new Date()
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)

  const oneWeek = new Date(now)
  oneWeek.setDate(oneWeek.getDate() + 7)

  const oneMonth = new Date(now)
  oneMonth.setDate(oneMonth.getDate() + 30)

  return events.filter((event) => {
    const eventDate = new Date(event.date)

    switch (timeframe) {
      case 'tonight':
        return eventDate <= endOfToday
      case 'week':
        return eventDate <= oneWeek
      case 'month':
        return eventDate <= oneMonth
      default:
        return true
    }
  })
}

export function formatEventDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return `In ${diffDays} days`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function getEventTypeColor(type: CelestialEvent['type']): string {
  const colors: Record<CelestialEvent['type'], string> = {
    meteor_shower: 'bg-accent/20 text-accent border-accent/50',
    planet: 'bg-secondary/20 text-secondary-foreground border-secondary/50',
    aurora: 'bg-green-500/20 text-green-300 border-green-500/50',
    eclipse: 'bg-destructive/20 text-destructive-foreground border-destructive/50',
    conjunction: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    moon_phase: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    comet: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  }
  return colors[type]
}

export function getEventTypeLabel(type: CelestialEvent['type']): string {
  const labels: Record<CelestialEvent['type'], string> = {
    meteor_shower: 'Meteor Shower',
    planet: 'Planet',
    aurora: 'Aurora',
    eclipse: 'Eclipse',
    conjunction: 'Conjunction',
    moon_phase: 'Moon Phase',
    comet: 'Comet',
  }
  return labels[type]
}
