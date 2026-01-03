import { useState, useEffect, useCallback } from 'react'

interface DeviceOrientationEventExtended extends DeviceOrientationEvent {
  webkitCompassHeading?: number
  webkitCompassAccuracy?: number
}

export interface CompassData {
  heading: number
  accuracy: number | null
  isCalibrating: boolean
  isSupported: boolean
}

export function useCompass() {
  const [compassData, setCompassData] = useState<CompassData>({
    heading: 0,
    accuracy: null,
    isCalibrating: false,
    isSupported: false,
  })
  const [isActive, setIsActive] = useState(false)
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt'>('prompt')

  const requestPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent === 'undefined') {
      setCompassData((prev) => ({ ...prev, isSupported: false }))
      return false
    }

    if (
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        setPermissionState(permission)
        return permission === 'granted'
      } catch (error) {
        console.error('Error requesting device orientation permission:', error)
        setPermissionState('denied')
        return false
      }
    } else {
      setPermissionState('granted')
      return true
    }
  }, [])

  const startCompass = useCallback(async () => {
    const hasPermission = await requestPermission()
    if (hasPermission) {
      setIsActive(true)
      setCompassData((prev) => ({ ...prev, isSupported: true }))
    }
  }, [requestPermission])

  const stopCompass = useCallback(() => {
    setIsActive(false)
  }, [])

  useEffect(() => {
    if (!isActive) return

    let lastHeading = 0
    const smoothingFactor = 0.3

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const extEvent = event as DeviceOrientationEventExtended
      let heading = 0

      if (extEvent.webkitCompassHeading !== undefined) {
        heading = extEvent.webkitCompassHeading
      } else if (event.alpha !== null) {
        heading = 360 - event.alpha
      }

      const smoothedHeading = lastHeading + (heading - lastHeading) * smoothingFactor
      lastHeading = smoothedHeading

      setCompassData((prev) => ({
        ...prev,
        heading: smoothedHeading,
        accuracy: extEvent.webkitCompassAccuracy !== undefined ? extEvent.webkitCompassAccuracy : null,
        isCalibrating: false,
      }))
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      if (event.rotationRate) {
        const totalRotation = Math.abs(event.rotationRate.alpha || 0) +
                             Math.abs(event.rotationRate.beta || 0) +
                             Math.abs(event.rotationRate.gamma || 0)
        
        setCompassData((prev) => ({
          ...prev,
          isCalibrating: totalRotation > 50,
        }))
      }
    }

    window.addEventListener('deviceorientation', handleOrientation, true)
    window.addEventListener('devicemotion', handleMotion, true)

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true)
      window.removeEventListener('devicemotion', handleMotion, true)
    }
  }, [isActive])

  return {
    compassData,
    isActive,
    permissionState,
    startCompass,
    stopCompass,
  }
}
