import { useEffect, useRef } from 'react'
import { ViewingSpot } from '@/lib/lightPollution'
import { UserLocation } from '@/lib/types'
import { getBortleColor } from '@/lib/lightPollution'
import { Card } from '@/components/ui/card'

interface LightPollutionMapProps {
  userLocation: UserLocation
  viewingSpots: ViewingSpot[]
  selectedSpot: ViewingSpot | null
  onSpotClick: (spot: ViewingSpot) => void
}

export function LightPollutionMap({
  userLocation,
  viewingSpots,
  selectedSpot,
  onSpotClick,
}: LightPollutionMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    const allPoints = [
      { lat: userLocation.latitude, lon: userLocation.longitude, bortle: 7 },
      ...viewingSpots.map((spot) => ({
        lat: spot.latitude,
        lon: spot.longitude,
        bortle: spot.bortle,
      })),
    ]

    const latitudes = allPoints.map((p) => p.lat)
    const longitudes = allPoints.map((p) => p.lon)
    const minLat = Math.min(...latitudes) - 0.1
    const maxLat = Math.max(...latitudes) + 0.1
    const minLon = Math.min(...longitudes) - 0.1
    const maxLon = Math.max(...longitudes) + 0.1

    const latToY = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * height
    const lonToX = (lon: number) => ((lon - minLon) / (maxLon - minLon)) * width

    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 1.5)
    gradient.addColorStop(0, 'rgba(255, 220, 150, 0.3)')
    gradient.addColorStop(0.5, 'rgba(140, 130, 110, 0.2)')
    gradient.addColorStop(1, 'rgba(40, 50, 90, 0.1)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    allPoints.forEach((point) => {
      const x = lonToX(point.lon)
      const y = latToY(point.lat)
      const radius = 80

      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius)
      const color = getBortleColor(point.bortle)
      grad.addColorStop(0, color.replace('rgb', 'rgba').replace(')', ', 0.6)'))
      grad.addColorStop(0.5, color.replace('rgb', 'rgba').replace(')', ', 0.3)'))
      grad.addColorStop(1, color.replace('rgb', 'rgba').replace(')', ', 0)'))

      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
    })

    viewingSpots.forEach((spot) => {
      const x = lonToX(spot.longitude)
      const y = latToY(spot.latitude)
      const isSelected = selectedSpot?.id === spot.id

      ctx.beginPath()
      ctx.arc(x, y, isSelected ? 8 : 6, 0, 2 * Math.PI)
      ctx.fillStyle = isSelected ? 'oklch(0.75 0.15 200)' : 'oklch(0.92 0.02 250)'
      ctx.fill()
      ctx.strokeStyle = isSelected ? 'oklch(0.75 0.15 200)' : 'oklch(0.30 0.08 250)'
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.stroke()

      if (isSelected) {
        ctx.beginPath()
        ctx.arc(x, y, 12, 0, 2 * Math.PI)
        ctx.strokeStyle = 'oklch(0.75 0.15 200 / 0.5)'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    const userX = lonToX(userLocation.longitude)
    const userY = latToY(userLocation.latitude)

    ctx.beginPath()
    ctx.arc(userX, userY, 10, 0, 2 * Math.PI)
    ctx.fillStyle = 'oklch(0.55 0.22 25)'
    ctx.fill()
    ctx.strokeStyle = 'oklch(0.98 0 0)'
    ctx.lineWidth = 2.5
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(userX, userY, 4, 0, 2 * Math.PI)
    ctx.fillStyle = 'oklch(0.98 0 0)'
    ctx.fill()
  }, [userLocation, viewingSpots, selectedSpot])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    const width = canvas.width
    const height = canvas.height

    const allPoints = [
      { lat: userLocation.latitude, lon: userLocation.longitude },
      ...viewingSpots.map((spot) => ({ lat: spot.latitude, lon: spot.longitude })),
    ]

    const latitudes = allPoints.map((p) => p.lat)
    const longitudes = allPoints.map((p) => p.lon)
    const minLat = Math.min(...latitudes) - 0.1
    const maxLat = Math.max(...latitudes) + 0.1
    const minLon = Math.min(...longitudes) - 0.1
    const maxLon = Math.max(...longitudes) + 0.1

    const latToY = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * height
    const lonToX = (lon: number) => ((lon - minLon) / (maxLon - minLon)) * width

    for (const spot of viewingSpots) {
      const x = lonToX(spot.longitude)
      const y = latToY(spot.latitude)
      const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2)

      if (distance < 15) {
        onSpotClick(spot)
        return
      }
    }
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        onClick={handleCanvasClick}
        className="w-full h-auto cursor-pointer"
        style={{ display: 'block' }}
      />
      <div className="p-4 bg-gradient-to-r from-card/90 to-card/60">
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive border-2 border-foreground" />
            <span className="text-muted-foreground">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-foreground border-2 border-border" />
            <span className="text-muted-foreground">Viewing Spots</span>
          </div>
          <div className="text-muted-foreground">Darker = Less Light Pollution</div>
        </div>
      </div>
    </Card>
  )
}
