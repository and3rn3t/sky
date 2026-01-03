import { useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { UserLocation } from '@/lib/types'
import {
  NotificationPreferences,
  StoredAlert,
  shouldNotify,
  sendSolarStormNotification,
} from '@/lib/notificationService'

const CHECK_INTERVAL_MS = 15 * 60 * 1000

export function useKpAlertMonitor(
  currentKp: number | null,
  location: UserLocation | null
) {
  const [preferences] = useKV<NotificationPreferences>('notification-preferences', {
    enabled: false,
    kpThreshold: 5,
    quietHoursStart: 23,
    quietHoursEnd: 7,
    soundEnabled: true,
  })

  const [lastAlerts, setLastAlerts] = useKV<StoredAlert[]>('kp-alert-history', [])
  const lastCheckRef = useRef<number>(0)
  const lastNotifiedKpRef = useRef<number>(0)

  useEffect(() => {
    if (!preferences || !location || !currentKp) return

    const checkAndNotify = () => {
      const now = Date.now()

      if (now - lastCheckRef.current < CHECK_INTERVAL_MS) {
        return
      }

      lastCheckRef.current = now

      if (!shouldNotify(currentKp, preferences, location)) {
        return
      }

      if (Math.abs(currentKp - lastNotifiedKpRef.current) < 0.5) {
        return
      }

      const recentAlerts = (lastAlerts || []).filter(
        (alert) => Date.now() - new Date(alert.timestamp).getTime() < 3 * 60 * 60 * 1000
      )

      const alreadyNotified = recentAlerts.some(
        (alert) => alert.kpIndex === currentKp && alert.notified
      )

      if (alreadyNotified) {
        return
      }

      sendSolarStormNotification(currentKp, location, preferences)
      lastNotifiedKpRef.current = currentKp

      const newAlert: StoredAlert = {
        id: `${Date.now()}-${currentKp}`,
        kpIndex: currentKp,
        timestamp: new Date().toISOString(),
        notified: true,
      }

      setLastAlerts((current) => {
        const filtered = (current || []).filter(
          (alert) => Date.now() - new Date(alert.timestamp).getTime() < 24 * 60 * 60 * 1000
        )
        return [...filtered, newAlert]
      })
    }

    const intervalId = setInterval(checkAndNotify, CHECK_INTERVAL_MS)

    checkAndNotify()

    return () => clearInterval(intervalId)
  }, [currentKp, location, preferences, lastAlerts, setLastAlerts])
}
