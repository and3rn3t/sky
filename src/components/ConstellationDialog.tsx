import { Constellation, Star, NotableObject } from '@/lib/constellations'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StarMap } from '@/components/StarMap'
import { Star as StarIcon, Sparkle, Book, Eye } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ConstellationDialogProps {
  constellation: Constellation | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConstellationDialog({ constellation, open, onOpenChange }: ConstellationDialogProps) {
  const [selectedStar, setSelectedStar] = useState<Star | null>(null)
  const [selectedObject, setSelectedObject] = useState<NotableObject | null>(null)

  if (!constellation) return null

  const handleStarClick = (star: Star) => {
    setSelectedStar(star)
    if (star.name) {
      toast.info(`Selected: ${star.name}`, {
        description: `Magnitude: ${star.magnitude.toFixed(1)}`,
      })
    }
  }

  const handleObjectClick = (obj: NotableObject) => {
    setSelectedObject(obj)
    toast.info(`Selected: ${obj.name}`, {
      description: obj.description,
    })
  }

  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-300 border-green-500/50',
    moderate: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    challenging: 'bg-red-500/20 text-red-300 border-red-500/50',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-card to-background border-border/50">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <StarIcon size={28} className="text-accent" weight="fill" />
                {constellation.name}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {constellation.abbr} - {constellation.description}
              </DialogDescription>
            </div>
            <Badge className={difficultyColors[constellation.difficulty]} variant="outline">
              {constellation.difficulty}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            <div className="rounded-lg overflow-hidden border border-border/50 bg-gradient-to-br from-primary/20 to-background">
              <StarMap
                constellation={constellation}
                onStarClick={handleStarClick}
                onObjectClick={handleObjectClick}
                showLabels={true}
                interactive={true}
              />
            </div>

            <Tabs defaultValue="mythology" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border border-border/50">
                <TabsTrigger
                  value="mythology"
                  className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent"
                >
                  <Book size={16} />
                  Mythology
                </TabsTrigger>
                <TabsTrigger
                  value="stars"
                  className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent"
                >
                  <StarIcon size={16} />
                  Stars
                </TabsTrigger>
                <TabsTrigger
                  value="objects"
                  className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent"
                >
                  <Sparkle size={16} />
                  Objects
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mythology" className="mt-4 space-y-4">
                <div className="rounded-lg bg-card/50 border border-border/50 p-4">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Book size={18} className="text-accent" />
                    Story & Mythology
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{constellation.mythology}</p>
                </div>

                <div className="rounded-lg bg-card/50 border border-border/50 p-4">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Eye size={18} className="text-accent" />
                    Viewing Information
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <strong className="text-foreground">Best Viewing Months:</strong>{' '}
                      {getMonthNames(constellation.bestViewingMonths)}
                    </p>
                    <p>
                      <strong className="text-foreground">Hemisphere:</strong>{' '}
                      {constellation.hemisphere === 'both'
                        ? 'Visible from both hemispheres'
                        : `Best from ${constellation.hemisphere} hemisphere`}
                    </p>
                    <p>
                      <strong className="text-foreground">Difficulty:</strong>{' '}
                      {constellation.difficulty.charAt(0).toUpperCase() + constellation.difficulty.slice(1)} to find
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stars" className="mt-4 space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Click on stars in the map above to learn more. Lower magnitude numbers indicate brighter stars.
                </p>
                {constellation.mainStars.map((star) => (
                  <div
                    key={star.id}
                    className={`rounded-lg bg-card/50 border p-3 transition-all cursor-pointer ${
                      selectedStar?.id === star.id
                        ? 'border-accent/70 bg-accent/10'
                        : 'border-border/50 hover:border-accent/30'
                    }`}
                    onClick={() => handleStarClick(star)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: star.color || '#ffffff' }}
                          />
                          {star.name || `Star ${star.id}`}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Apparent Magnitude: {star.magnitude.toFixed(1)}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-secondary/20 text-secondary-foreground">
                        {star.magnitude < 1.5 ? 'Very Bright' : star.magnitude < 3 ? 'Bright' : 'Visible'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="objects" className="mt-4 space-y-3">
                {constellation.notableObjects.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click on objects in the map above to learn more about these deep sky wonders.
                    </p>
                    {constellation.notableObjects.map((obj) => (
                      <div
                        key={obj.id}
                        className={`rounded-lg bg-card/50 border p-4 transition-all cursor-pointer ${
                          selectedObject?.id === obj.id
                            ? 'border-accent/70 bg-accent/10'
                            : 'border-border/50 hover:border-accent/30'
                        }`}
                        onClick={() => handleObjectClick(obj)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                              <Sparkle size={16} className="text-accent" />
                              {obj.name}
                            </h4>
                            <Badge
                              variant="outline"
                              className={
                                obj.requiresTelescope
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                                  : 'bg-green-500/20 text-green-300 border-green-500/50'
                              }
                            >
                              {obj.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{obj.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/30">
                            {obj.magnitude && (
                              <span>
                                <strong>Magnitude:</strong> {obj.magnitude.toFixed(1)}
                              </span>
                            )}
                            <span>
                              <strong>Equipment:</strong>{' '}
                              {obj.requiresTelescope ? 'Telescope required' : 'Naked eye or binoculars'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkle size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No notable deep sky objects catalogued for this constellation.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function getMonthNames(months: number[]): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  if (months.length === 12) return 'Year-round'
  if (months.length > 6) return 'Most of the year'

  return months.map(m => monthNames[m - 1]).join(', ')
}
