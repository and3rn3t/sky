import { UserLocation } from '@/lib/types'
import { MapPin, ArrowsClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface LocationHeaderProps {
  location: UserLocation | null
  onRefresh: () => void
  isLoading: boolean
}

export function LocationHeader({ location, onRefresh, isLoading }: LocationHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
    >
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Night Sky Tonight
        </h1>
        <p className="text-xs text-muted-foreground/80">Powered by NASA & astronomical data</p>
        {location ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin size={16} weight="fill" />
            <span className="text-sm">
              {location.city && location.region ? (
                <span className="hidden sm:inline">
                  {location.city}, {location.region} ({location.latitude.toFixed(2)}°,{' '}
                  {location.longitude.toFixed(2)}°)
                </span>
              ) : (
                <span>
                  {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°
                </span>
              )}
              {location.city && location.region && (
                <span className="sm:hidden">
                  {location.city}, {location.region}
                </span>
              )}
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Location not set</p>
        )}
      </div>

      <Button
        onClick={onRefresh}
        disabled={isLoading}
        className="bg-accent/20 hover:bg-accent/30 text-accent-foreground border border-accent/50 hover:border-accent"
      >
        <ArrowsClockwise size={18} className={isLoading ? 'animate-spin' : ''} />
        <span className="ml-2">{isLoading ? 'Loading...' : 'Refresh Events'}</span>
      </Button>
    </motion.div>
  )
}
