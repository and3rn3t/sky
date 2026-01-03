import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { UserLocation } from '@/lib/types'
import {
  NotificationPreferences,
  requestNotificationPermission,
  getRecommendedKpThreshold,
} from '@/lib/notificationService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  BellSlash,
  Moon,
  SpeakerHigh,
  SpeakerSlash,
  Info,
  Lightning,
  CheckCircle,
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface NotificationSettingsProps {
  location: UserLocation | null
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: false,
  kpThreshold: 5,
  quietHoursStart: 23,
  quietHoursEnd: 7,
  soundEnabled: true,
}

export function NotificationSettings({ location }: NotificationSettingsProps) {
  const [storedPrefs, setStoredPrefs] = useKV<NotificationPreferences>(
    'notification-preferences',
    DEFAULT_PREFERENCES
  )

  const preferences = storedPrefs || DEFAULT_PREFERENCES

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )

  const [testNotificationSent, setTestNotificationSent] = useState(false)

  useEffect(() => {
    if (location && preferences.kpThreshold === 5) {
      const recommended = getRecommendedKpThreshold(location.latitude)
      setStoredPrefs({
        ...preferences,
        kpThreshold: recommended,
      })
    }
  }, [location])

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission()
    setPermissionStatus(Notification.permission)

    if (granted) {
      setStoredPrefs({
        ...preferences,
        enabled: true,
      })
      toast.success('Notifications enabled successfully')
    } else {
      toast.error('Notification permission denied')
    }
  }

  const handleDisableNotifications = () => {
    setStoredPrefs({
      ...preferences,
      enabled: false,
    })
    toast.success('Notifications disabled')
  }

  const handleKpThresholdChange = (value: number[]) => {
    setStoredPrefs({
      ...preferences,
      kpThreshold: value[0],
    })
  }

  const handleQuietHoursStartChange = (value: number[]) => {
    setStoredPrefs({
      ...preferences,
      quietHoursStart: value[0],
    })
  }

  const handleQuietHoursEndChange = (value: number[]) => {
    setStoredPrefs({
      ...preferences,
      quietHoursEnd: value[0],
    })
  }

  const handleSoundToggle = (checked: boolean) => {
    setStoredPrefs({
      ...preferences,
      soundEnabled: checked,
    })
  }

  const handleTestNotification = () => {
    if (Notification.permission !== 'granted') {
      toast.error('Please enable notifications first')
      return
    }

    const notification = new Notification('🌌 Test Alert: Solar Storm!', {
      body: `This is how you'll be notified when Kp index reaches ${preferences.kpThreshold}.`,
      icon: '🌌',
      tag: 'test-notification',
      silent: !preferences.soundEnabled,
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    setTestNotificationSent(true)
    toast.success('Test notification sent')
    setTimeout(() => setTestNotificationSent(false), 3000)
  }

  const getKpDescription = (kp: number): string => {
    if (kp >= 9) return 'Extreme storms only'
    if (kp >= 8) return 'Severe storms'
    if (kp >= 7) return 'Strong storms'
    if (kp >= 6) return 'Moderate storms'
    if (kp >= 5) return 'Minor storms'
    if (kp >= 4) return 'Active conditions'
    if (kp >= 3) return 'Unsettled conditions'
    return 'Any activity'
  }

  const getKpBadgeVariant = (kp: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (kp >= 7) return 'destructive'
    if (kp >= 5) return 'default'
    if (kp >= 3) return 'secondary'
    return 'outline'
  }

  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:00 ${period}`
  }

  const recommendedKp = location ? getRecommendedKpThreshold(location.latitude) : 5

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell size={20} className="text-accent" weight="fill" />
          Solar Storm Alerts
        </CardTitle>
        <CardDescription>
          Get notified when aurora viewing conditions reach your threshold
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {permissionStatus === 'denied' && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <BellSlash size={18} />
            <AlertDescription>
              Notifications are blocked. Please enable them in your browser settings to receive
              aurora alerts.
            </AlertDescription>
          </Alert>
        )}

        {!location && (
          <Alert className="border-accent/50 bg-accent/10">
            <Info size={18} />
            <AlertDescription>
              Enable location access to get personalized aurora alerts for your area.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-notifications" className="text-base font-semibold">
                Enable Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications for solar storms
              </p>
            </div>
            <Switch
              id="enable-notifications"
              checked={preferences.enabled && permissionStatus === 'granted'}
              onCheckedChange={(checked) =>
                checked ? handleEnableNotifications() : handleDisableNotifications()
              }
              disabled={permissionStatus === 'denied'}
            />
          </div>

          {preferences.enabled && permissionStatus === 'granted' && (
            <>
              <div className="space-y-3 pt-4 border-t border-border/50">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Lightning size={16} className="text-accent" />
                      Alert Threshold: Kp {preferences.kpThreshold}+
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {getKpDescription(preferences.kpThreshold)}
                    </p>
                    {location && preferences.kpThreshold !== recommendedKp && (
                      <p className="text-xs text-muted-foreground">
                        Recommended for your location: Kp {recommendedKp}+
                      </p>
                    )}
                  </div>
                  <Badge variant={getKpBadgeVariant(preferences.kpThreshold)}>
                    Kp {preferences.kpThreshold}
                  </Badge>
                </div>
                <Slider
                  value={[preferences.kpThreshold]}
                  onValueChange={handleKpThresholdChange}
                  min={0}
                  max={9}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Kp 0 (All activity)</span>
                  <span>Kp 9 (Extreme only)</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border/50">
                <div>
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Moon size={16} className="text-muted-foreground" />
                    Quiet Hours
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    No notifications between {formatHour(preferences.quietHoursStart)} and{' '}
                    {formatHour(preferences.quietHoursEnd)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Start: {formatHour(preferences.quietHoursStart)}</Label>
                  <Slider
                    value={[preferences.quietHoursStart]}
                    onValueChange={handleQuietHoursStartChange}
                    min={0}
                    max={23}
                    step={1}
                    className="py-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">End: {formatHour(preferences.quietHoursEnd)}</Label>
                  <Slider
                    value={[preferences.quietHoursEnd]}
                    onValueChange={handleQuietHoursEndChange}
                    min={0}
                    max={23}
                    step={1}
                    className="py-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-enabled" className="text-base font-semibold">
                    Sound
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound with notifications
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {preferences.soundEnabled ? (
                    <SpeakerHigh size={20} className="text-muted-foreground" />
                  ) : (
                    <SpeakerSlash size={20} className="text-muted-foreground" />
                  )}
                  <Switch
                    id="sound-enabled"
                    checked={preferences.soundEnabled}
                    onCheckedChange={handleSoundToggle}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <Button
                  onClick={handleTestNotification}
                  variant="outline"
                  className="w-full border-accent/30 hover:border-accent/50 hover:bg-accent/10"
                  disabled={testNotificationSent}
                >
                  {testNotificationSent ? (
                    <>
                      <CheckCircle size={18} weight="fill" className="text-accent" />
                      Test Sent!
                    </>
                  ) : (
                    <>
                      <Bell size={18} />
                      Send Test Notification
                    </>
                  )}
                </Button>
              </div>

              <Alert className="border-accent/30 bg-accent/5">
                <Info size={18} />
                <AlertDescription className="text-xs">
                  Alerts are checked every 15 minutes. You'll be notified when the Kp index reaches
                  your threshold and conditions are favorable for aurora viewing at your location.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
