import { ViewingSpot } from '@/lib/lightPollution'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Path, CaretRight } from '@phosphor-icons/react'
import { getBortleDescription } from '@/lib/lightPollution'

interface ViewingSpotCardProps {
  spot: ViewingSpot
  onClick: () => void
  userLocation: { latitude: number; longitude: number }
}

export function ViewingSpotCard({ spot, onClick, userLocation }: ViewingSpotCardProps) {
  const getBortleRating = (bortle: number) => {
    if (bortle <= 3) return { text: 'Excellent', color: 'bg-green-500/20 text-green-300 border-green-500/50' }
    if (bortle <= 5) return { text: 'Good', color: 'bg-accent/20 text-accent border-accent/50' }
    if (bortle <= 7) return { text: 'Fair', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' }
    return { text: 'Poor', color: 'bg-destructive/20 text-destructive-foreground border-destructive/50' }
  }

  const rating = getBortleRating(spot.bortle)

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer border-border/50 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-card-foreground leading-tight">{spot.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin size={12} />
              <span>{spot.distance.toFixed(1)} miles away</span>
            </div>
          </div>
          <Badge className={`${rating.color} border text-xs`}>{rating.text}</Badge>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">{spot.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-accent" weight="fill" />
              <span className="text-foreground font-medium">{spot.rating.toFixed(1)}</span>
            </div>
            <div className="text-muted-foreground">
              Bortle {spot.bortle}
            </div>
          </div>
          <CaretRight size={16} className="text-muted-foreground" />
        </div>

        {spot.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {spot.amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {spot.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{spot.amenities.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
