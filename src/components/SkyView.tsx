import { useState } from 'react'
import { Constellation } from '@/lib/constellations'
import { StarMap } from '@/components/StarMap'
import { Compass } from '@/components/Compass'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, Compass as CompassIcon } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface SkyViewProps {
  constellation: Constellation
  onStarClick?: (star: any) => void
  onObjectClick?: (object: any) => void
}

export function SkyView({ constellation, onStarClick, onObjectClick }: SkyViewProps) {
  const [currentHeading, setCurrentHeading] = useState(0)
  const [currentDirection, setCurrentDirection] = useState('N')

  const handleDirectionChange = (heading: number, direction: string) => {
    setCurrentHeading(heading)
    setCurrentDirection(direction)
  }

  const getConstellationDirection = () => {
    if (constellation.hemisphere === 'northern' || constellation.hemisphere === 'both') {
      if (constellation.name === 'Ursa Major' || constellation.name === 'Ursa Minor') {
        return 'Look North'
      } else if (constellation.name === 'Orion' || constellation.name === 'Taurus') {
        return 'Look South'
      } else if (constellation.name === 'Leo' || constellation.name === 'Cancer') {
        return 'Look East in evening'
      } else if (constellation.name === 'Aquarius' || constellation.name === 'Pegasus') {
        return 'Look West in evening'
      }
    }
    return 'Visible overhead'
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm border border-border/50">
          <TabsTrigger value="map" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
            <Star size={18} />
            Star Map
          </TabsTrigger>
          <TabsTrigger value="compass" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
            <CompassIcon size={18} />
            Compass
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border/50">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{constellation.name}</h3>
                    <p className="text-sm text-muted-foreground">{constellation.abbr}</p>
                  </div>
                  <Badge variant="outline" className="bg-secondary/20 border-secondary/50">
                    {constellation.hemisphere === 'northern' ? 'Northern Sky' : 
                     constellation.hemisphere === 'southern' ? 'Southern Sky' : 'Both Hemispheres'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-accent">
                  <CompassIcon size={18} />
                  <span>{getConstellationDirection()}</span>
                </div>

                <StarMap
                  constellation={constellation}
                  onStarClick={onStarClick}
                  onObjectClick={onObjectClick}
                />

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Brightest Star</p>
                    <p className="text-sm font-semibold">
                      {constellation.mainStars.reduce((prev, current) => 
                        (prev.magnitude < current.magnitude) ? prev : current
                      ).name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Difficulty</p>
                    <p className="text-sm font-semibold capitalize">{constellation.difficulty}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="compass" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Compass onDirectionChange={handleDirectionChange} />
            
            <Card className="mt-4 p-4 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border/50">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Finding {constellation.name}</h4>
                <p className="text-sm text-muted-foreground">
                  To find {constellation.name}, {getConstellationDirection().toLowerCase()}. Use the compass to orient yourself correctly and look up at the night sky.
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">You're facing</p>
                    <p className="text-lg font-bold text-accent">{currentDirection}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Look for</p>
                    <p className="text-sm font-semibold">{constellation.name}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
