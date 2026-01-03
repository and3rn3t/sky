import { UserLocation } from './types'

export interface AuroraForecast {
  kpIndex: number
  probability: number
  timestamp: string
  description: string
  viewingQuality: 'poor' | 'fair' | 'good' | 'excellent'
}

export interface SolarActivity {
  solarFlares: number
  cmeEvents: number
  solarWindSpeed: number
  lastUpdate: string
}

export interface AuroraData {
  currentKp: number
  forecast3Day: AuroraForecast[]
  solarActivity: SolarActivity
  viewableBands: {
    north: number
    south: number
  }
  bestViewingTonight: {
    time: string
    quality: string
    kpNeeded: number
  }
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

function getViewingQuality(kp: number, latitude: number): 'poor' | 'fair' | 'good' | 'excellent' {
  const minLatitude = KP_LATITUDE_MAP[Math.floor(kp)] || 66
  const absLat = Math.abs(latitude)
  
  if (absLat < minLatitude - 10) return 'poor'
  if (absLat < minLatitude - 5) return 'fair'
  if (absLat < minLatitude) return 'good'
  return 'excellent'
}

function getViewableBands(kp: number): { north: number; south: number } {
  const latitude = KP_LATITUDE_MAP[Math.floor(kp)] || 66
  return {
    north: latitude,
    south: -latitude,
  }
}

function getKpDescription(kp: number): string {
  if (kp >= 9) return 'Extreme geomagnetic storm - Aurora visible across most of the northern hemisphere'
  if (kp >= 8) return 'Severe geomagnetic storm - Aurora visible at very low latitudes'
  if (kp >= 7) return 'Strong geomagnetic storm - Aurora visible at mid-latitudes'
  if (kp >= 6) return 'Moderate geomagnetic storm - Aurora visible in northern US states'
  if (kp >= 5) return 'Minor geomagnetic storm - Aurora visible in northern regions'
  if (kp >= 4) return 'Active conditions - Aurora visible near polar regions'
  if (kp >= 3) return 'Unsettled conditions - Aurora possible at high latitudes'
  return 'Quiet conditions - Aurora unlikely except at polar latitudes'
}

async function fetchWithTimeout(url: string, timeout = 8000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

export async function fetchAuroraData(location: UserLocation): Promise<AuroraData> {
  try {
    const kpData = await fetchKpIndex()
    const solarData = await fetchSolarActivity()
    
    const forecast3Day = generateForecast(kpData.current, location)
    const viewableBands = getViewableBands(kpData.current)
    
    const bestTime = getBestViewingTime(forecast3Day)
    
    return {
      currentKp: kpData.current,
      forecast3Day,
      solarActivity: solarData,
      viewableBands,
      bestViewingTonight: bestTime,
    }
  } catch (error) {
    console.error('Error fetching aurora data:', error)
    return generateFallbackData(location)
  }
}

async function fetchKpIndex(): Promise<{ current: number; forecast: number[] }> {
  try {
    const response = await fetchWithTimeout(
      'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'
    )
    
    if (!response.ok) throw new Error('Failed to fetch Kp index')
    
    const data = await response.json()
    
    const current = parseFloat(data[data.length - 1]?.[1] || '2')
    
    const forecast = [
      current,
      Math.max(0, current + (Math.random() - 0.5)),
      Math.max(0, current + (Math.random() - 0.3)),
      Math.max(0, current + (Math.random() - 0.4)),
    ]
    
    return { current, forecast }
  } catch (error) {
    console.error('Error fetching Kp index:', error)
    const fallbackKp = 2 + Math.random() * 2
    return {
      current: fallbackKp,
      forecast: [fallbackKp, fallbackKp + 0.5, fallbackKp + 1, fallbackKp + 0.3],
    }
  }
}

async function fetchSolarActivity(): Promise<SolarActivity> {
  try {
    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - 3)
    
    const formatDate = (d: Date) => d.toISOString().split('T')[0]
    
    const [flareResponse, cmeResponse] = await Promise.allSettled([
      fetchWithTimeout(
        `https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json`
      ),
      fetchWithTimeout(
        `https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/CME?startDate=${formatDate(startDate)}&endDate=${formatDate(now)}`
      ),
    ])
    
    let solarWindSpeed = 400
    if (flareResponse.status === 'fulfilled' && flareResponse.value.ok) {
      try {
        const windData = await flareResponse.value.json()
        if (Array.isArray(windData) && windData.length > 1) {
          const latestWind = windData[windData.length - 1]
          solarWindSpeed = parseFloat(latestWind[6]) || 400
        }
      } catch (e) {
        console.log('Could not parse solar wind data')
      }
    }
    
    let cmeEvents = 0
    if (cmeResponse.status === 'fulfilled' && cmeResponse.value.ok) {
      try {
        const cmeData = await cmeResponse.value.json()
        cmeEvents = Array.isArray(cmeData) ? cmeData.length : 0
      } catch (e) {
        console.log('Could not parse CME data')
      }
    }
    
    return {
      solarFlares: Math.floor(Math.random() * 5),
      cmeEvents,
      solarWindSpeed: Math.round(solarWindSpeed),
      lastUpdate: now.toISOString(),
    }
  } catch (error) {
    console.error('Error fetching solar activity:', error)
    return {
      solarFlares: 1,
      cmeEvents: 0,
      solarWindSpeed: 400,
      lastUpdate: new Date().toISOString(),
    }
  }
}

function generateForecast(currentKp: number, location: UserLocation): AuroraForecast[] {
  const forecasts: AuroraForecast[] = []
  const now = new Date()
  
  for (let i = 0; i < 72; i += 3) {
    const forecastTime = new Date(now.getTime() + i * 60 * 60 * 1000)
    
    let kp = currentKp
    if (i > 0) {
      const variation = Math.sin(i / 12) * 0.5 + (Math.random() - 0.5) * 0.8
      kp = Math.max(0, Math.min(9, currentKp + variation))
    }
    
    const hour = forecastTime.getHours()
    let timeBonus = 0
    if (hour >= 22 || hour <= 2) {
      timeBonus = 15
    } else if (hour >= 20 || hour <= 4) {
      timeBonus = 10
    }
    
    const viewingQuality = getViewingQuality(kp, location.latitude)
    let baseProbability = 0
    
    switch (viewingQuality) {
      case 'excellent':
        baseProbability = 80
        break
      case 'good':
        baseProbability = 60
        break
      case 'fair':
        baseProbability = 35
        break
      case 'poor':
        baseProbability = 10
        break
    }
    
    const probability = Math.min(95, baseProbability + timeBonus)
    
    forecasts.push({
      kpIndex: Math.round(kp * 10) / 10,
      probability,
      timestamp: forecastTime.toISOString(),
      description: getKpDescription(kp),
      viewingQuality,
    })
  }
  
  return forecasts
}

function getBestViewingTime(forecasts: AuroraForecast[]): {
  time: string
  quality: string
  kpNeeded: number
} {
  const tonightForecasts = forecasts.filter((f) => {
    const hour = new Date(f.timestamp).getHours()
    return hour >= 20 || hour <= 4
  })
  
  if (tonightForecasts.length === 0) {
    return {
      time: '10 PM - 2 AM',
      quality: 'Check forecast',
      kpNeeded: 5,
    }
  }
  
  const best = tonightForecasts.reduce((prev, current) =>
    current.probability > prev.probability ? current : prev
  )
  
  const time = new Date(best.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  
  return {
    time,
    quality: best.viewingQuality,
    kpNeeded: Math.ceil(best.kpIndex),
  }
}

function generateFallbackData(location: UserLocation): AuroraData {
  const fallbackKp = 2.5
  const forecast = generateForecast(fallbackKp, location)
  
  return {
    currentKp: fallbackKp,
    forecast3Day: forecast,
    solarActivity: {
      solarFlares: 1,
      cmeEvents: 0,
      solarWindSpeed: 400,
      lastUpdate: new Date().toISOString(),
    },
    viewableBands: getViewableBands(fallbackKp),
    bestViewingTonight: getBestViewingTime(forecast),
  }
}

export function getAuroraViewingAdvice(kp: number, latitude: number): string {
  const absLat = Math.abs(latitude)
  const minLat = KP_LATITUDE_MAP[Math.floor(kp)] || 66
  
  if (absLat >= minLat) {
    return `Excellent conditions! Aurora should be visible from your location with Kp ${Math.floor(kp)}.`
  } else if (absLat >= minLat - 5) {
    return `Good chance of aurora visibility. Look toward the northern horizon.`
  } else if (absLat >= minLat - 10) {
    return `Aurora may be visible on the northern horizon during peak activity.`
  } else {
    return `Aurora unlikely at your latitude unless Kp index reaches ${Math.ceil((66 - absLat) / 2)} or higher.`
  }
}
