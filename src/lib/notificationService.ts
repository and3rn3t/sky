import { UserLocation } from './types'

export interface NotificationPreferences {
  enabled: boolean
  kpThreshold: number
  quietHoursStart: number
  quietHoursEnd: number
  soundEnabled: boolean
}

export interface StoredAlert {
  id: string
  kpIndex: number
  timestamp: string
  notified: boolean
}

const KP_LATITUDE_MAP: Record<number, number> = {
  0: 66,
  1: 64,
  2: 62,
  3: 60,
  4: 58,
  5: 56,
  6: 50,
  7: 45,
  8: 40,
  9: 35,
}

export function getMinimumKpForLocation(latitude: number): number {
  const absLat = Math.abs(latitude)
  
  for (let kp = 0; kp <= 9; kp++) {
    const requiredLat = KP_LATITUDE_MAP[kp] || 66
    if (absLat >= requiredLat - 5) {
      return kp
    }
  }
  
  return 9
}

export function getRecommendedKpThreshold(latitude: number): number {
  const minKp = getMinimumKpForLocation(latitude)
  return Math.max(3, minKp)
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export function isWithinQuietHours(
  preferences: NotificationPreferences
): boolean {
  const now = new Date()
  const currentHour = now.getHours()
  
  const { quietHoursStart, quietHoursEnd } = preferences
  
  if (quietHoursStart < quietHoursEnd) {
    return currentHour >= quietHoursStart && currentHour < quietHoursEnd
  } else {
    return currentHour >= quietHoursStart || currentHour < quietHoursEnd
  }
}

export function shouldNotify(
  kpIndex: number,
  preferences: NotificationPreferences,
  location: UserLocation
): boolean {
  if (!preferences.enabled) return false
  
  if (kpIndex < preferences.kpThreshold) return false
  
  if (isWithinQuietHours(preferences)) return false
  
  const minKp = getMinimumKpForLocation(location.latitude)
  if (kpIndex < minKp) return false
  
  return true
}

export function sendSolarStormNotification(
  kpIndex: number,
  location: UserLocation,
  preferences: NotificationPreferences
): void {
  if (Notification.permission !== 'granted') return
  
  const title = getNotificationTitle(kpIndex)
  const body = getNotificationBody(kpIndex, location)
  const icon = getNotificationIcon(kpIndex)
  
  const notification = new Notification(title, {
    body,
    icon,
    badge: icon,
    tag: 'solar-storm-alert',
    requireInteraction: kpIndex >= 7,
    silent: !preferences.soundEnabled,
  })
  
  notification.onclick = () => {
    window.focus()
    notification.close()
  }
}

function getNotificationTitle(kpIndex: number): string {
  if (kpIndex >= 9) return '🔴 Extreme Solar Storm Alert!'
  if (kpIndex >= 8) return '🔴 Severe Solar Storm Alert!'
  if (kpIndex >= 7) return '🟠 Strong Solar Storm Alert!'
  if (kpIndex >= 6) return '🟠 Moderate Solar Storm!'
  if (kpIndex >= 5) return '🟡 Minor Solar Storm'
  if (kpIndex >= 4) return '🟢 Active Aurora Conditions'
  return '🟢 Aurora Activity Detected'
}

function getNotificationBody(kpIndex: number, location: UserLocation): string {
  const absLat = Math.abs(location.latitude).toFixed(1)
  const direction = location.latitude >= 0 ? 'N' : 'S'
  
  if (kpIndex >= 9) {
    return `Extreme geomagnetic storm (Kp ${kpIndex.toFixed(1)})! Aurora visible across most regions. Visible from ${absLat}°${direction}.`
  }
  if (kpIndex >= 8) {
    return `Severe storm (Kp ${kpIndex.toFixed(1)})! Aurora visible at very low latitudes. Look to the sky now!`
  }
  if (kpIndex >= 7) {
    return `Strong storm (Kp ${kpIndex.toFixed(1)})! Aurora visible at mid-latitudes. Check outside!`
  }
  if (kpIndex >= 6) {
    return `Moderate storm (Kp ${kpIndex.toFixed(1)}). Aurora visible in northern regions. Look north tonight!`
  }
  if (kpIndex >= 5) {
    return `Minor storm (Kp ${kpIndex.toFixed(1)}). Aurora possible in high latitude areas.`
  }
  if (kpIndex >= 4) {
    return `Active conditions (Kp ${kpIndex.toFixed(1)}). Aurora visible near polar regions.`
  }
  return `Aurora activity detected (Kp ${kpIndex.toFixed(1)}). Monitor conditions.`
}

function getNotificationIcon(kpIndex: number): string {
  if (kpIndex >= 7) return '🌌'
  if (kpIndex >= 5) return '✨'
  return '⭐'
}

export function getKpAlertLevel(kpIndex: number): 'low' | 'medium' | 'high' | 'extreme' {
  if (kpIndex >= 8) return 'extreme'
  if (kpIndex >= 6) return 'high'
  if (kpIndex >= 4) return 'medium'
  return 'low'
}
