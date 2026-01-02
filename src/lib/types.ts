export interface CelestialEvent {
  id: string
  name: string
  type: 'meteor_shower' | 'planet' | 'aurora' | 'eclipse' | 'conjunction' | 'moon_phase' | 'comet'
  date: string
  peakTime?: string
  description: string
  educationalContent: string
  viewingTips: string
  bestViewingTime: string
  visibilityScore: number
  isVisibleNow: boolean
  nextVisibleIn?: string
  rarity: 'common' | 'uncommon' | 'rare'
  requiredEquipment?: string
}

export interface UserLocation {
  latitude: number
  longitude: number
  city?: string
  region?: string
}
