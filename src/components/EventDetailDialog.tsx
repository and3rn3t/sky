import { CelestialEvent } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Clock, Eye, Sparkle, Binoculars } from '@phosphor-icons/react'
import { formatEventDate, getEventTypeColor, getEventTypeLabel } from '@/lib/celestial'

interface EventDetailDialogProps {
  event: CelestialEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventDetailDialog({ event, open, onOpenChange }: EventDetailDialogProps) {
  if (!event) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-gradient-to-br from-card to-card/80 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <div className="space-y-3">
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
                  <Sparkle className="mr-1" size={14} />
                  Rare Event
                </Badge>
              )}
            </div>
            <DialogTitle className="text-2xl font-bold">{event.name}</DialogTitle>
            <DialogDescription className="text-base text-foreground/80">
              {event.description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock size={16} />
                  <span className="font-medium">Date</span>
                </div>
                <p className="text-foreground">{formatEventDate(event.date)}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye size={16} />
                  <span className="font-medium">Best Viewing Time</span>
                </div>
                <p className="text-foreground">{event.bestViewingTime}</p>
              </div>

              {event.requiredEquipment && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Binoculars size={16} />
                    <span className="font-medium">Equipment</span>
                  </div>
                  <p className="text-foreground">{event.requiredEquipment}</p>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkle size={16} />
                  <span className="font-medium">Visibility Score</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent/50 to-accent transition-all"
                      style={{ width: `${event.visibilityScore}%` }}
                    />
                  </div>
                  <span className="text-foreground font-medium">{event.visibilityScore}%</span>
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Viewing Tips</h3>
              <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
                {event.viewingTips}
              </p>
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Educational Information</h3>
              <div className="text-foreground/90 leading-relaxed whitespace-pre-line space-y-3">
                {event.educationalContent}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
