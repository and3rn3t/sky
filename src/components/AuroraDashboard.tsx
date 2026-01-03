import { useEffect, useState } from 'react'
import { UserLocation } from '@/lib/types'
import { AuroraData, fetchAuroraData, getAuroraViewingAdvice } from '@/lib/auroraApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sun,
  MoonStars,
  CloudMoon,
  ArrowsClockwise,
  Info,
  Lightning,
  Wind,
  Gauge,
  MapPin,
  Clock,
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface AuroraDashboardProps {
  location: UserLocation | null
}

export function AuroraDashboard({ location }: AuroraDashboardProps) {
  const [auroraData, setAuroraData] = useState<AuroraData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    if (location) {
      loadAuroraData()
    }
  }, [location])

  const loadAuroraData = async () => {
    if (!location) return

    setIsLoading(true)
    try {
      const data = await fetchAuroraData(location)
      setAuroraData(data)
      setLastUpdate(new Date())
      toast.success('Aurora forecast updated')
    } catch (error) {
      console.error('Error loading aurora data:', error)
      toast.error('Error loading aurora forecast')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadAuroraData()
  }

  if (!location) {
    return (
      <div className="space-y-6">
        <Alert className="border-accent/50 bg-accent/10">
          <Info size={18} />
          <AlertDescription>
            Enable location access to see personalized aurora forecasts for your area.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading && !auroraData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full bg-card/50" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 bg-card/50" />
          <Skeleton className="h-32 bg-card/50" />
          <Skeleton className="h-32 bg-card/50" />
        </div>
      </div>
    )
  }

  if (!auroraData) return null

  const getKpColor = (kp: number) => {
    if (kp >= 7) return 'text-destructive'
    if (kp >= 5) return 'text-accent'
    if (kp >= 3) return 'text-secondary'
    return 'text-muted-foreground'
  }

  const getKpBadgeVariant = (kp: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (kp >= 7) return 'destructive'
    if (kp >= 5) return 'default'
    if (kp >= 3) return 'secondary'
    return 'outline'
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'text-accent'
      case 'good':
        return 'text-secondary'
      case 'fair':
        return 'text-muted-foreground'
      default:
        return 'text-muted-foreground'
    }
  }

  const tonightForecasts = auroraData.forecast3Day.filter((f) => {
    const forecastDate = new Date(f.timestamp)
    const today = new Date()
    return forecastDate.getDate() === today.getDate()
  })

  const upcomingForecasts = auroraData.forecast3Day.filter((f) => {
    const forecastDate = new Date(f.timestamp)
    const today = new Date()
    return forecastDate.getDate() !== today.getDate()
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CloudMoon size={28} className="text-accent" weight="fill" />
            Aurora Forecast
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time Northern Lights predictions powered by NOAA Space Weather data
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="border-accent/30 hover:border-accent/50"
        >
          <ArrowsClockwise size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="bg-gradient-to-br from-card/80 to-card/40 border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge size={18} className="text-accent" />
              Current Kp Index
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-4xl font-bold ${getKpColor(auroraData.currentKp)}`}>
                {auroraData.currentKp.toFixed(1)}
              </div>
              <Progress value={auroraData.currentKp * 11.11} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Scale: 0 (quiet) to 9 (extreme storm)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card/80 to-card/40 border-secondary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock size={18} className="text-secondary" />
              Best Viewing Tonight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{auroraData.bestViewingTonight.time}</div>
              <Badge variant={getKpBadgeVariant(auroraData.bestViewingTonight.kpNeeded)}>
                {auroraData.bestViewingTonight.quality}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Kp {auroraData.bestViewingTonight.kpNeeded}+ needed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card/80 to-card/40 border-border/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin size={18} className="text-muted-foreground" />
              Your Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-xl font-semibold">
                {Math.abs(location.latitude).toFixed(1)}°{location.latitude >= 0 ? 'N' : 'S'}
              </div>
              <p className="text-sm text-muted-foreground">
                {location.city || location.region || 'Unknown location'}
              </p>
              <p className="text-xs text-muted-foreground">
                Viewable from {auroraData.viewableBands.north}°N+
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card className="bg-card/50 backdrop-blur-sm border-accent/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={20} className="text-accent" />
            Viewing Outlook
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">
            {getAuroraViewingAdvice(auroraData.currentKp, location.latitude)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Aurora viewing is best in dark areas away from light pollution, typically between 10 PM
            and 2 AM. Look toward the northern horizon for dancing curtains of green, red, or
            purple light.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun size={20} className="text-accent" />
            Solar Activity
          </CardTitle>
          <CardDescription>
            Last updated: {new Date(auroraData.solarActivity.lastUpdate).toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lightning size={18} />
                <span className="text-sm">Solar Flares (3 days)</span>
              </div>
              <div className="text-2xl font-bold">{auroraData.solarActivity.solarFlares}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MoonStars size={18} />
                <span className="text-sm">CME Events (3 days)</span>
              </div>
              <div className="text-2xl font-bold">{auroraData.solarActivity.cmeEvents}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wind size={18} />
                <span className="text-sm">Solar Wind Speed</span>
              </div>
              <div className="text-2xl font-bold">
                {auroraData.solarActivity.solarWindSpeed}{' '}
                <span className="text-sm font-normal">km/s</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tonight" className="space-y-4">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-card/50 backdrop-blur-sm border border-border/50">
          <TabsTrigger
            value="tonight"
            className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent"
          >
            Tonight
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent"
          >
            3-Day Forecast
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tonight" className="space-y-3">
          <h3 className="text-lg font-semibold">Tonight's Hourly Forecast</h3>
          {tonightForecasts.map((forecast, index) => {
            const time = new Date(forecast.timestamp)
            return (
              <motion.div
                key={forecast.timestamp}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="bg-card/30 hover:bg-card/50 transition-colors border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[60px]">
                          <div className="text-sm font-semibold">
                            {time.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              hour12: true,
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getKpBadgeVariant(forecast.kpIndex)}>
                              Kp {forecast.kpIndex.toFixed(1)}
                            </Badge>
                            <span className={`text-sm font-medium ${getQualityColor(forecast.viewingQuality)}`}>
                              {forecast.viewingQuality}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground max-w-md">
                            {forecast.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent">
                          {forecast.probability}%
                        </div>
                        <div className="text-xs text-muted-foreground">visibility</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-3">
          <h3 className="text-lg font-semibold">Extended Forecast</h3>
          {upcomingForecasts.slice(0, 12).map((forecast, index) => {
            const time = new Date(forecast.timestamp)
            return (
              <motion.div
                key={forecast.timestamp}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="bg-card/30 hover:bg-card/50 transition-colors border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[80px]">
                          <div className="text-sm font-semibold">
                            {time.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              hour12: true,
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {time.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getKpBadgeVariant(forecast.kpIndex)}>
                              Kp {forecast.kpIndex.toFixed(1)}
                            </Badge>
                            <span className={`text-sm font-medium ${getQualityColor(forecast.viewingQuality)}`}>
                              {forecast.viewingQuality}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground max-w-md">
                            {forecast.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent">
                          {forecast.probability}%
                        </div>
                        <div className="text-xs text-muted-foreground">visibility</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </TabsContent>
      </Tabs>

      {lastUpdate && (
        <p className="text-xs text-muted-foreground text-center">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
