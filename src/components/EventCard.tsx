import { CelestialEvent } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Sparkle, Eye } from '@phosphor-icons/react'
import { formatEventDate, getEventTypeColor, getEventTypeLabel } from '@/lib/celestial'
import { motion } from 'framer-motion'

interface EventCardProps {
  event: CelestialEvent
  onClick: () => void
}

export function EventCard({ event, onClick }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="h-full"
    >
      <Card
        onClick={onClick}
        className="h-full cursor-pointer overflow-hidden border-border/50 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20"
      >
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${getEventTypeColor(event.type)} border`}>
                  {getEventTypeLabel(event.type)}
                </Badge>
                {event.isVisibleNow && (
                  <Badge className="bg-accent/20 text-accent border-accent/50 border pulse-glow">
                    Visible Now
                  </Badge>
                )}
                {event.rarity === 'rare' && (
                  <Badge variant="outline" className="border-secondary/50 text-secondary-foreground">
                    <Sparkle className="mr-1" size={12} />
                    Rare
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-card-foreground leading-tight">
                {event.name}
              </h3>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={14} />
              <span>{formatEventDate(event.date)}</span>
              {event.bestViewingTime && (
                <>
                  <span>•</span>
                  <span>{event.bestViewingTime}</span>
                </>
              )}
            </div>

            {!event.isVisibleNow && event.nextVisibleIn && (
              <div className="flex items-center gap-2 text-accent/80">
                <Eye size={14} />
                <span>Visible {event.nextVisibleIn}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent/50 to-accent transition-all"
                  style={{ width: `${event.visibilityScore}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground min-w-[3ch] text-right">
                {event.visibilityScore}%
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
