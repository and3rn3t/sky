import { ViewingSpot } from '@/lib/lightPollution'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MapPin, Star, Path, NavigationArrow, Info } from '@phosphor-icons/react'
import { getBortleDescription } from '@/lib/lightPollution'

interface ViewingSpotDialogProps {
  spot: ViewingSpot | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewingSpotDialog({ spot, open, onOpenChange }: ViewingSpotDialogProps) {
  if (!spot) return null

  const getBortleRating = (bortle: number) => {
    if (bortle <= 3) return { text: 'Excellent', color: 'bg-green-500/20 text-green-300 border-green-500/50' }
    if (bortle <= 5) return { text: 'Good', color: 'bg-accent/20 text-accent border-accent/50' }
    if (bortle <= 7) return { text: 'Fair', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' }
    return { text: 'Poor', color: 'bg-destructive/20 text-destructive-foreground border-destructive/50' }
  }

  const rating = getBortleRating(spot.bortle)

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`
    window.open(url, '_blank')
  }

  const getAccessibilityColor = (accessibility: string) => {
    if (accessibility === 'easy') return 'bg-green-500/20 text-green-300 border-green-500/50'
    if (accessibility === 'moderate') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
    return 'bg-orange-500/20 text-orange-300 border-orange-500/50'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl">{spot.name}</DialogTitle>
          <DialogDescription className="text-base">{spot.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={`${rating.color} border`}>{rating.text} Viewing</Badge>
            <Badge className={`${getAccessibilityColor(spot.accessibility)} border capitalize`}>
              {spot.accessibility}
            </Badge>
            <div className="flex items-center gap-1 text-sm">
              <Star size={16} className="text-accent" weight="fill" />
              <span className="font-medium">{spot.rating.toFixed(1)}</span>
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={18} className="text-accent" />
                <h4 className="font-semibold">Location Details</h4>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground ml-6">
                <p>Distance: {spot.distance.toFixed(1)} miles away</p>
                <p className="text-xs font-mono">
                  {spot.latitude.toFixed(4)}°, {spot.longitude.toFixed(4)}°
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Info size={18} className="text-accent" />
                <h4 className="font-semibold">Light Pollution</h4>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground ml-6">
                <p>Bortle Scale: {spot.bortle} - {getBortleDescription(spot.bortle)}</p>
                <p className="text-xs">
                  {spot.bortle <= 3 && 'Excellent conditions for deep sky observations. Milky Way is prominent.'}
                  {spot.bortle === 4 && 'Good viewing conditions. Milky Way visible with some detail.'}
                  {spot.bortle === 5 && 'Decent suburban conditions. Major constellations visible.'}
                  {spot.bortle === 6 && 'Bright suburban sky. Only brighter celestial objects visible.'}
                  {spot.bortle >= 7 && 'Significant light pollution. Limited to bright planets and Moon.'}
                </p>
              </div>
            </div>

            {spot.amenities.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2 ml-6">
                  {spot.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-border/50" />

          <Button
            onClick={openDirections}
            className="w-full bg-accent/20 hover:bg-accent/30 text-accent border border-accent/50"
          >
            <NavigationArrow size={18} />
            Get Directions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
