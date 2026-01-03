import { useKV } from '@github/spark/hooks'
import { StoredAlert } from '@/lib/notificationService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, Info, Lightning } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function AlertHistory() {
  const [alerts] = useKV<StoredAlert[]>('kp-alert-history', [])

  const recentAlerts = (alerts || [])
    .filter((alert) => Date.now() - new Date(alert.timestamp).getTime() < 24 * 60 * 60 * 1000)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  if (recentAlerts.length === 0) {
    return null
  }

  const getKpBadgeVariant = (kp: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (kp >= 7) return 'destructive'
    if (kp >= 5) return 'default'
    if (kp >= 3) return 'secondary'
    return 'outline'
  }

  const formatTimeAgo = (timestamp: string): string => {
    const now = Date.now()
    const then = new Date(timestamp).getTime()
    const diff = now - then

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return new Date(timestamp).toLocaleDateString()
    }
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell size={20} className="text-accent" weight="fill" />
          Recent Alerts (24h)
        </CardTitle>
        <CardDescription>Your recent solar storm notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <Lightning size={20} className="text-accent" weight="fill" />
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getKpBadgeVariant(alert.kpIndex)}>
                      Kp {alert.kpIndex.toFixed(1)}
                    </Badge>
                    <span className="text-sm font-medium">Solar Storm Alert</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimeAgo(alert.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}
