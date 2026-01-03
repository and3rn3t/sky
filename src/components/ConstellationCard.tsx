import { Constellation } from '@/lib/constellations'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Binoculars, Eye } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface ConstellationCardProps {
  constellation: Constellation
  onClick: () => void
}

export function ConstellationCard({ constellation, onClick }: ConstellationCardProps) {
  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-300 border-green-500/50',
    moderate: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    challenging: 'bg-red-500/20 text-red-300 border-red-500/50',
  }

  const hemisphereIcons = {
    northern: '🌍',
    southern: '🌏',
    both: '🌎',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="cursor-pointer overflow-hidden bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10"
        onClick={onClick}
      >
        <CardContent className="p-5">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Star size={20} className="text-accent" weight="fill" />
                  {constellation.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {constellation.abbr} {hemisphereIcons[constellation.hemisphere]}
                </p>
              </div>
              <Badge className={difficultyColors[constellation.difficulty]} variant="outline">
                {constellation.difficulty}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {constellation.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye size={14} />
                <span>{constellation.mainStars.length} stars</span>
              </div>
              <div className="flex items-center gap-1">
                <Binoculars size={14} />
                <span>{constellation.notableObjects.length} objects</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Best viewing: {getMonthNames(constellation.bestViewingMonths)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function getMonthNames(months: number[]): string {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  
  if (months.length === 12) return 'Year-round'
  if (months.length > 6) return 'Most of the year'
  
  return months.slice(0, 3).map(m => monthNames[m - 1]).join(', ')
}
