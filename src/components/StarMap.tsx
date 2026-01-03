import { useEffect, useRef, useState } from 'react'
import { Constellation, Star, NotableObject } from '@/lib/constellations'
import { motion } from 'framer-motion'

interface StarMapProps {
  constellation: Constellation
  onStarClick?: (star: Star) => void
  onObjectClick?: (object: NotableObject) => void
  showLabels?: boolean
  interactive?: boolean
}

export function StarMap({
  constellation,
  onStarClick,
  onObjectClick,
  showLabels = true,
  interactive = true,
}: StarMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredStar, setHoveredStar] = useState<Star | null>(null)
  const [hoveredObject, setHoveredObject] = useState<NotableObject | null>(null)
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 })

  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current?.parentElement
      if (container) {
        const width = Math.min(container.clientWidth, 800)
        const height = Math.min(width * 0.833, 600)
        setDimensions({ width, height })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, dimensions.width, dimensions.height)

    const scaleX = dimensions.width / 500
    const scaleY = dimensions.height / 500

    ctx.strokeStyle = 'rgba(147, 197, 253, 0.3)'
    ctx.lineWidth = 1.5
    ctx.lineCap = 'round'

    constellation.lines.forEach((line) => {
      const fromStar = constellation.mainStars.find((s) => s.id === line.from)
      const toStar = constellation.mainStars.find((s) => s.id === line.to)

      if (fromStar && toStar) {
        ctx.beginPath()
        ctx.moveTo(fromStar.x * scaleX, fromStar.y * scaleY)
        ctx.lineTo(toStar.x * scaleX, toStar.y * scaleY)
        ctx.stroke()
      }
    })

    constellation.mainStars.forEach((star) => {
      const x = star.x * scaleX
      const y = star.y * scaleY
      const baseSize = Math.max(3, 8 - star.magnitude)
      const size = hoveredStar?.id === star.id && interactive ? baseSize * 1.5 : baseSize

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2)
      gradient.addColorStop(0, star.color || '#ffffff')
      gradient.addColorStop(0.5, `${star.color || '#ffffff'}88`)
      gradient.addColorStop(1, 'transparent')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, size * 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = star.color || '#ffffff'
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()

      if (showLabels && star.name) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.font = '12px Space Grotesk, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(star.name, x, y - size - 8)
      }
    })

    constellation.notableObjects.forEach((obj) => {
      const x = obj.x * scaleX
      const y = obj.y * scaleY
      const size = hoveredObject?.id === obj.id && interactive ? 8 : 6

      if (obj.type === 'nebula') {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
        gradient.addColorStop(0, 'rgba(147, 51, 234, 0.6)')
        gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.3)')
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, size * 3, 0, Math.PI * 2)
        ctx.fill()
      } else if (obj.type === 'galaxy') {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.PI / 4)
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2)
        gradient.addColorStop(0, 'rgba(251, 191, 36, 0.6)')
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.ellipse(0, 0, size * 3, size * 1.5, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      } else if (obj.type === 'cluster') {
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2
          const distance = size * 1.5
          const cx = x + Math.cos(angle) * distance
          const cy = y + Math.sin(angle) * distance
          ctx.fillStyle = 'rgba(147, 197, 253, 0.7)'
          ctx.beginPath()
          ctx.arc(cx, cy, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.strokeStyle = 'rgba(147, 197, 253, 0.8)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.stroke()
    })
  }, [constellation, dimensions, hoveredStar, hoveredObject, showLabels, interactive])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 500
    const y = ((e.clientY - rect.top) / rect.height) * 500

    const clickedStar = constellation.mainStars.find((star) => {
      const dx = star.x - x
      const dy = star.y - y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance < 15
    })

    if (clickedStar && onStarClick) {
      onStarClick(clickedStar)
      return
    }

    const clickedObject = constellation.notableObjects.find((obj) => {
      const dx = obj.x - x
      const dy = obj.y - y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance < 20
    })

    if (clickedObject && onObjectClick) {
      onObjectClick(clickedObject)
    }
  }

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 500
    const y = ((e.clientY - rect.top) / rect.height) * 500

    const hoveredSt = constellation.mainStars.find((star) => {
      const dx = star.x - x
      const dy = star.y - y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance < 15
    })

    const hoveredObj = constellation.notableObjects.find((obj) => {
      const dx = obj.x - x
      const dy = obj.y - y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance < 20
    })

    setHoveredStar(hoveredSt || null)
    setHoveredObject(hoveredObj || null)
  }

  return (
    <div className="relative">
      <motion.canvas
        ref={canvasRef}
        className={`w-full bg-gradient-to-br from-primary/40 to-background rounded-lg ${
          interactive ? 'cursor-pointer' : ''
        }`}
        style={{ width: dimensions.width, height: dimensions.height }}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMove}
        onMouseLeave={() => {
          setHoveredStar(null)
          setHoveredObject(null)
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />

      {interactive && (hoveredStar || hoveredObject) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3"
        >
          {hoveredStar && (
            <div>
              <p className="font-semibold text-foreground">{hoveredStar.name}</p>
              <p className="text-sm text-muted-foreground">
                Magnitude: {hoveredStar.magnitude.toFixed(1)}
              </p>
            </div>
          )}
          {hoveredObject && (
            <div>
              <p className="font-semibold text-foreground">{hoveredObject.name}</p>
              <p className="text-sm text-muted-foreground">{hoveredObject.description}</p>
              <p className="text-xs text-accent mt-1">
                {hoveredObject.requiresTelescope ? 'Requires telescope' : 'Visible with naked eye/binoculars'}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
