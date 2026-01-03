import { useCompass } from '@/hooks/use-compass'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Compass as CompassIcon, Warning, Info } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface CompassProps {
  onDirectionChange?: (heading: number, direction: string) => void
}

const DIRECTIONS = [
  { name: 'N', angle: 0, label: 'North' },
  { name: 'NE', angle: 45, label: 'Northeast' },
  { name: 'E', angle: 90, label: 'East' },
  { name: 'SE', angle: 135, label: 'Southeast' },
  { name: 'S', angle: 180, label: 'South' },
  { name: 'SW', angle: 225, label: 'Southwest' },
  { name: 'W', angle: 270, label: 'West' },
  { name: 'NW', angle: 315, label: 'Northwest' },
]

function getDirection(heading: number): string {
  const normalizedHeading = ((heading % 360) + 360) % 360
  const index = Math.round(normalizedHeading / 45) % 8
  return DIRECTIONS[index].name
}

export function Compass({ onDirectionChange }: CompassProps) {
  const { compassData, isActive, permissionState, startCompass, stopCompass } = useCompass()

  const currentDirection = getDirection(compassData.heading)

  if (onDirectionChange && isActive) {
    onDirectionChange(compassData.heading, currentDirection)
  }

  if (!compassData.isSupported && permissionState !== 'prompt') {
    return (
      <Alert className="border-destructive/50 bg-destructive/10">
        <Warning size={18} />
        <AlertDescription>
          Compass not supported on this device. Try using a mobile device with orientation sensors.
        </AlertDescription>
      </Alert>
    )
  }

  if (permissionState === 'denied') {
    return (
      <Alert className="border-destructive/50 bg-destructive/10">
        <Warning size={18} />
        <AlertDescription>
          Device orientation permission denied. Please enable it in your browser settings to use the compass.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {!isActive && (
        <Alert className="border-accent/50 bg-accent/10">
          <Info size={18} />
          <AlertDescription>
            Enable compass to get real-time sky orientation for accurate star finding. Point your device at the sky to identify celestial objects.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border/50">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CompassIcon size={24} className="text-accent" />
              Sky Compass
            </h3>
            {isActive && (
              <Badge variant="outline" className="bg-accent/20 border-accent/50 text-accent">
                Active
              </Badge>
            )}
          </div>

          <div className="relative w-64 h-64">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-border/30 bg-gradient-to-br from-primary/20 to-secondary/20"
              animate={{
                boxShadow: isActive
                  ? ['0 0 20px rgba(147, 197, 253, 0.3)', '0 0 30px rgba(147, 197, 253, 0.5)', '0 0 20px rgba(147, 197, 253, 0.3)']
                  : '0 0 0 rgba(147, 197, 253, 0)',
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                rotate: isActive ? -compassData.heading : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 20,
              }}
            >
              <div className="relative w-full h-full">
                {DIRECTIONS.map((dir) => {
                  const isCardinal = dir.angle % 90 === 0
                  const radian = (dir.angle * Math.PI) / 180
                  const radius = 110
                  const x = Math.sin(radian) * radius
                  const y = -Math.cos(radian) * radius

                  return (
                    <div
                      key={dir.name}
                      className="absolute"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      }}
                    >
                      <div
                        className={`font-bold ${
                          isCardinal ? 'text-lg text-accent' : 'text-sm text-muted-foreground'
                        } ${dir.name === 'N' ? 'text-accent text-xl' : ''}`}
                        style={{
                          transform: `rotate(${isActive ? compassData.heading : 0}deg)`,
                        }}
                      >
                        {dir.name}
                      </div>
                    </div>
                  )
                })}

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    className="w-16 h-16 relative"
                    animate={{
                      rotate: isActive ? compassData.heading : 0,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 100,
                      damping: 20,
                    }}
                  >
                    <div className="absolute left-1/2 top-0 w-0 h-0 -translate-x-1/2"
                      style={{
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderBottom: '24px solid rgb(147, 197, 253)',
                      }}
                    />
                    <div className="absolute left-1/2 bottom-0 w-0 h-0 -translate-x-1/2"
                      style={{
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '16px solid rgb(100, 100, 120)',
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {compassData.isCalibrating && isActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <CompassIcon size={32} className="text-accent mx-auto" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground mt-2">Calibrating...</p>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 w-full">
            {isActive ? (
              <>
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent">
                    {Math.round(compassData.heading)}°
                  </div>
                  <div className="text-lg text-muted-foreground">{currentDirection}</div>
                  {compassData.accuracy !== null && compassData.accuracy > 20 && (
                    <div className="text-sm text-destructive flex items-center gap-1 justify-center mt-1">
                      <Warning size={16} />
                      Low accuracy - calibrate device
                    </div>
                  )}
                </div>
                <Button
                  onClick={stopCompass}
                  variant="outline"
                  className="w-full mt-2 border-accent/30 hover:border-accent/50"
                >
                  Stop Compass
                </Button>
              </>
            ) : (
              <Button
                onClick={startCompass}
                className="w-full bg-gradient-to-r from-accent/80 to-secondary/80 hover:from-accent hover:to-secondary"
              >
                <CompassIcon size={18} />
                Enable Compass
              </Button>
            )}
          </div>

          {isActive && (
            <p className="text-xs text-center text-muted-foreground">
              Point your device at the sky. The compass shows which direction you're facing to help identify stars and constellations.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
