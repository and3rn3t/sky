import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { CelestialEvent, UserLocation } from '@/lib/types'
import {
  getUserLocation,
  generateCelestialEvents,
  getEventsByTimeframe,
} from '@/lib/celestial'
import { LocationHeader } from '@/components/LocationHeader'
import { EventCard } from '@/components/EventCard'
import { EventDetailDialog } from '@/components/EventDetailDialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Info, MoonStars } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

function App() {
  const [location, setLocation] = useKV<UserLocation | null>('user-location', null)
  const [events, setEvents] = useKV<CelestialEvent[]>('celestial-events', [])
  const [selectedEvent, setSelectedEvent] = useState<CelestialEvent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'tonight' | 'week' | 'month'>('tonight')
  const [locationRequested, setLocationRequested] = useState(false)

  useEffect(() => {
    if (!location && !locationRequested) {
      setLocationRequested(true)
      requestLocation()
    }
  }, [location, locationRequested])

  const requestLocation = async () => {
    setIsLoading(true)
    try {
      const userLocation = await getUserLocation()
      if (userLocation) {
        setLocation(() => userLocation)
        await loadEvents(userLocation)
        toast.success('Location detected successfully')
      } else {
        toast.error('Could not detect location. Please enable location access.')
      }
    } catch (error) {
      console.error('Error getting location:', error)
      toast.error('Error detecting location')
    } finally {
      setIsLoading(false)
    }
  }

  const loadEvents = async (userLocation: UserLocation) => {
    setIsLoading(true)
    try {
      const celestialEvents = await generateCelestialEvents(userLocation)
      setEvents(() => celestialEvents)
      toast.success(`Loaded ${celestialEvents.length} celestial events`)
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Error loading celestial events')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!location) {
      await requestLocation()
    } else {
      await loadEvents(location)
    }
  }

  const filteredEvents = getEventsByTimeframe(events || [], activeTab)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (a.isVisibleNow !== b.isVisibleNow) return a.isVisibleNow ? -1 : 1
    return b.visibilityScore - a.visibilityScore
  })

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-background">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
        </div>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, oklch(0.92 0.02 250) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 relative z-10">
        <LocationHeader
          location={location || null}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {!location && !isLoading && (
          <Alert className="mb-8 border-accent/50 bg-accent/10">
            <Info size={18} />
            <AlertDescription>
              Enable location access to see personalized celestial events for your area. We use your
              location to calculate which astronomical phenomena are visible from your position.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-card/50 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="tonight" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
              Tonight
            </TabsTrigger>
            <TabsTrigger value="week" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
              This Week
            </TabsTrigger>
            <TabsTrigger value="month" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
              This Month
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full bg-card/50" />
                  </div>
                ))}
              </div>
            ) : sortedEvents.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {sortedEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <EventCard event={event} onClick={() => setSelectedEvent(event)} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <MoonStars size={64} className="mx-auto text-muted-foreground opacity-50" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">No Events Found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {!location
                      ? 'Enable location access to see celestial events in your area.'
                      : 'No celestial events found for this timeframe. Try checking a different period.'}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <EventDetailDialog
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      />
    </div>
  )
}

export default App