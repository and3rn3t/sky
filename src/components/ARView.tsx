import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCompass } from '@/hooks/use-compass'
import { Constellation } from '@/lib/constellations'
import { 
  X, 
  Info, 
  Target, 
  Eye,
  Crosshair,
  Star,
  Circle
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface ARViewProps {
  constellations: Constellation[]
  onClose: () => void
  onConstellationClick?: (constellation: Constellation) => void
}

interface ConstellationPosition {
  constellation: Constellation
  azimuth: number
  altitude: number
  isVisible: boolean
}

const FIELD_OF_VIEW = 60
const ALTITUDE_RANGE = 45

const getConstellationAzimuth = (constellationId: string): number => {
  const azimuthMap: Record<string, number> = {
    'orion': 180,
    'ursa-major': 0,
    'cassiopeia': 350,
    'leo': 120,
    'scorpius': 180,
    'cygnus': 45,
  }
  return azimuthMap[constellationId] ?? Math.random() * 360
}

const getConstellationAltitude = (constellationId: string): number => {
  const altitudeMap: Record<string, number> = {
    'orion': 45,
    'ursa-major': 60,
    'cassiopeia': 70,
    'leo': 50,
    'scorpius': 30,
    'cygnus': 55,
  }
  return altitudeMap[constellationId] ?? 45
}

const normalizeAngle = (angle: number): number => {
  let normalized = angle % 360
  if (normalized < 0) normalized += 360
  return normalized
}

const getAngleDifference = (angle1: number, angle2: number): number => {
  const diff = Math.abs(normalizeAngle(angle1) - normalizeAngle(angle2))
  return diff > 180 ? 360 - diff : diff
}

export function ARView({ constellations, onClose, onConstellationClick }: ARViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deviceOrientation, setDeviceOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 })
  const [showInfo, setShowInfo] = useState(true)
  const { compassData, startCompass, stopCompass, isActive, permissionState } = useCompass()
  const [constellationPositions, setConstellationPositions] = useState<ConstellationPosition[]>([])
  const [selectedConstellation, setSelectedConstellation] = useState<Constellation | null>(null)

  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error('Camera access error:', err)
        setError('Camera access denied. Please enable camera permissions to use AR view.')
      }
    }

    initCamera()
    startCompass()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      stopCompass()
    }
  }, [])

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setDeviceOrientation({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0,
      })
    }

    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true)
      
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation, true)
            }
          })
          .catch(console.error)
      }
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true)
    }
  }, [])

  useEffect(() => {
    const positions: ConstellationPosition[] = constellations.map((constellation) => {
      const azimuth = getConstellationAzimuth(constellation.id)
      const altitude = getConstellationAltitude(constellation.id)
      
      const azimuthDiff = getAngleDifference(compassData.heading, azimuth)
      const altitudeDiff = Math.abs(45 - altitude)
      
      const isVisible = azimuthDiff < FIELD_OF_VIEW / 2 && altitudeDiff < ALTITUDE_RANGE
      
      return {
        constellation,
        azimuth,
        altitude,
        isVisible,
      }
    })

    setConstellationPositions(positions)
  }, [constellations, compassData.heading])

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawOverlay = () => {
      canvas.width = video.videoWidth || canvas.width
      canvas.height = video.videoHeight || canvas.height

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      constellationPositions.forEach((pos) => {
        if (!pos.isVisible) return

        const azimuthDiff = getAngleDifference(compassData.heading, pos.azimuth)
        const normalizedAzimuth = azimuthDiff > 180 ? azimuthDiff - 360 : azimuthDiff
        
        const x = (canvas.width / 2) + (normalizedAzimuth / FIELD_OF_VIEW) * canvas.width
        const altitudeNormalized = (pos.altitude - 45) / ALTITUDE_RANGE
        const y = (canvas.height / 2) - (altitudeNormalized * canvas.height)

        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return

        drawConstellation(ctx, pos.constellation, x, y)
      })

      requestAnimationFrame(drawOverlay)
    }

    drawOverlay()
  }, [constellationPositions, compassData.heading])

  const drawConstellation = (
    ctx: CanvasRenderingContext2D,
    constellation: Constellation,
    centerX: number,
    centerY: number
  ) => {
    const scale = 0.3
    const isSelected = selectedConstellation?.id === constellation.id

    const starMap = new Map(
      constellation.mainStars.map((star) => [star.id, star])
    )

    ctx.strokeStyle = isSelected ? '#5BFFC1' : 'rgba(91, 255, 193, 0.6)'
    ctx.lineWidth = isSelected ? 3 : 2
    ctx.shadowColor = '#5BFFC1'
    ctx.shadowBlur = isSelected ? 20 : 10
    ctx.lineCap = 'round'

    constellation.lines.forEach((line) => {
      const fromStar = starMap.get(line.from)
      const toStar = starMap.get(line.to)
      
      if (fromStar && toStar) {
        const fromX = centerX + (fromStar.x - 250) * scale
        const fromY = centerY + (fromStar.y - 250) * scale
        const toX = centerX + (toStar.x - 250) * scale
        const toY = centerY + (toStar.y - 250) * scale

        ctx.beginPath()
        ctx.moveTo(fromX, fromY)
        ctx.lineTo(toX, toY)
        ctx.stroke()
      }
    })

    constellation.mainStars.forEach((star) => {
      const x = centerX + (star.x - 250) * scale
      const y = centerY + (star.y - 250) * scale
      const radius = Math.max(3, 8 - star.magnitude)

      ctx.fillStyle = star.color || '#ffffff'
      ctx.shadowColor = star.color || '#ffffff'
      ctx.shadowBlur = 15

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()

      if (star.name) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.font = '12px Space Grotesk'
        ctx.shadowBlur = 5
        ctx.fillText(star.name, x + 10, y - 5)
      }
    })

    ctx.shadowBlur = 0
    ctx.fillStyle = isSelected ? '#5BFFC1' : 'rgba(255, 255, 255, 0.9)'
    ctx.font = 'bold 18px Space Grotesk'
    ctx.shadowColor = '#000000'
    ctx.shadowBlur = 8
    ctx.fillText(constellation.name, centerX, centerY - 100)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    const canvasX = x * scaleX
    const canvasY = y * scaleY

    for (const pos of constellationPositions) {
      if (!pos.isVisible) continue

      const azimuthDiff = getAngleDifference(compassData.heading, pos.azimuth)
      const normalizedAzimuth = azimuthDiff > 180 ? azimuthDiff - 360 : azimuthDiff
      
      const centerX = (canvasRef.current.width / 2) + (normalizedAzimuth / FIELD_OF_VIEW) * canvasRef.current.width
      const altitudeNormalized = (pos.altitude - 45) / ALTITUDE_RANGE
      const centerY = (canvasRef.current.height / 2) - (altitudeNormalized * canvasRef.current.height)

      const distance = Math.sqrt(
        Math.pow(canvasX - centerX, 2) + Math.pow(canvasY - centerY, 2)
      )

      if (distance < 100) {
        setSelectedConstellation(pos.constellation)
        onConstellationClick?.(pos.constellation)
        return
      }
    }

    setSelectedConstellation(null)
  }

  const visibleCount = constellationPositions.filter((p) => p.isVisible).length

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="absolute inset-0 w-full h-full cursor-crosshair"
        />

        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <div className="flex items-start justify-between gap-4 pointer-events-auto">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                  <Eye size={14} />
                  AR Mode Active
                </Badge>
                {isActive && (
                  <Badge variant="outline" className="bg-background/20 border-white/20 text-white">
                    <Crosshair size={14} />
                    {Math.round(compassData.heading)}°
                  </Badge>
                )}
              </div>
              
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert className="bg-background/80 backdrop-blur-sm border-accent/30">
                    <Info size={16} />
                    <AlertDescription className="text-xs">
                      Point your camera at the sky. Move your device to discover {visibleCount} constellation{visibleCount !== 1 ? 's' : ''} in view.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="bg-background/20 hover:bg-background/40 text-white border border-white/20"
            >
              <X size={24} />
            </Button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
          <div className="space-y-3 pointer-events-auto">
            {selectedConstellation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Card className="bg-background/90 backdrop-blur-sm border-accent/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <Star size={20} className="text-accent" weight="fill" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg">{selectedConstellation.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {selectedConstellation.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {selectedConstellation.abbr}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            selectedConstellation.difficulty === 'easy' && "border-green-500/50 text-green-400",
                            selectedConstellation.difficulty === 'moderate' && "border-yellow-500/50 text-yellow-400",
                            selectedConstellation.difficulty === 'challenging' && "border-red-500/50 text-red-400"
                          )}
                        >
                          {selectedConstellation.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                  <div className="flex items-center gap-2 text-sm">
                    <Target size={16} className="text-accent" />
                    <span className="text-white font-medium">{visibleCount} in view</span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInfo(!showInfo)}
                className="bg-background/20 hover:bg-background/40 text-white border border-white/20"
              >
                <Info size={16} />
                {showInfo ? 'Hide' : 'Show'} Info
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative w-8 h-8">
            <Circle size={32} weight="thin" className="text-accent/50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-accent"></div>
            </div>
          </div>
        </div>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/90">
            <Alert className="max-w-md border-destructive/50 bg-destructive/10">
              <Info size={18} />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  )
}
