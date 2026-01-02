import { UserLocation } from './types'

export interface ViewingSpot {
  id: string
  name: string
  latitude: number
  longitude: number
  distance: number
  bortle: number
  description: string
  accessibility: 'easy' | 'moderate' | 'difficult'
  amenities: string[]
  rating: number
}

declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
  llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>
}

export async function findNearbyViewingSpots(location: UserLocation): Promise<ViewingSpot[]> {
  const prompt = spark.llmPrompt`You are an astronomy expert who knows about dark sky locations and light pollution.

Given a location at latitude ${location.latitude}, longitude ${location.longitude} (${location.city || 'unknown city'}, ${location.region || 'unknown region'}), generate 5-8 realistic viewing spots within 50 miles that would be good for stargazing.

For each spot, provide:
- id: a unique slug
- name: the name of the location (park, viewpoint, observatory, etc.)
- latitude: slightly different from the user's location (within 0.5 degrees)
- longitude: slightly different from the user's location (within 0.5 degrees)
- distance: distance in miles from user location (between 5-50 miles)
- bortle: Bortle scale rating (1-9, where 1 is darkest skies, 9 is brightest city)
- description: 1-2 sentences about this location
- accessibility: one of "easy", "moderate", "difficult"
- amenities: array of amenities like "Parking", "Restrooms", "Picnic Area", "Viewing Platform"
- rating: user rating out of 5 (use decimals like 4.5)

Make the spots realistic for this geographic area. Consider:
- Urban areas should have viewing spots with Bortle 5-7 ratings
- Suburban areas should have spots with Bortle 4-6 ratings
- Rural areas can have spots with Bortle 2-4 ratings

Return as JSON with a single property "spots" containing the array.`

  try {
    const result = await spark.llm(prompt, 'gpt-4o', true)
    const parsed = JSON.parse(result)
    return parsed.spots || []
  } catch (error) {
    console.error('Error finding viewing spots:', error)
    return getFallbackSpots(location)
  }
}

function getFallbackSpots(location: UserLocation): ViewingSpot[] {
  return [
    {
      id: 'nearby-park',
      name: 'Local Park',
      latitude: location.latitude + 0.05,
      longitude: location.longitude + 0.05,
      distance: 3.2,
      bortle: 6,
      description: 'A nearby park with open fields, offering decent views away from street lights.',
      accessibility: 'easy',
      amenities: ['Parking', 'Restrooms'],
      rating: 3.8,
    },
    {
      id: 'viewpoint',
      name: 'Hilltop Viewpoint',
      latitude: location.latitude + 0.15,
      longitude: location.longitude - 0.10,
      distance: 12.5,
      bortle: 4,
      description: 'Elevated viewpoint with panoramic views and minimal light pollution.',
      accessibility: 'moderate',
      amenities: ['Parking', 'Viewing Platform'],
      rating: 4.5,
    },
  ]
}

export function getBortleColor(bortle: number): string {
  if (bortle <= 2) return 'rgb(10, 20, 40)'
  if (bortle <= 3) return 'rgb(20, 30, 60)'
  if (bortle <= 4) return 'rgb(40, 50, 90)'
  if (bortle <= 5) return 'rgb(80, 90, 130)'
  if (bortle <= 6) return 'rgb(140, 130, 110)'
  if (bortle <= 7) return 'rgb(200, 170, 120)'
  return 'rgb(255, 220, 150)'
}

export function getBortleDescription(bortle: number): string {
  const descriptions: Record<number, string> = {
    1: 'Excellent Dark-Sky Site',
    2: 'Typical Truly Dark Site',
    3: 'Rural Sky',
    4: 'Rural/Suburban Transition',
    5: 'Suburban Sky',
    6: 'Bright Suburban Sky',
    7: 'Suburban/Urban Transition',
    8: 'City Sky',
    9: 'Inner-City Sky',
  }
  return descriptions[bortle] || 'Unknown'
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
