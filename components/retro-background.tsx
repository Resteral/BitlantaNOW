"use client"

import { useEffect, useRef } from "react"

export function RetroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    let animationId: number
    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Underwater depth gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "rgba(10, 10, 15, 0.9)")
      gradient.addColorStop(0.5, "rgba(26, 26, 46, 0.7)")
      gradient.addColorStop(1, "rgba(60, 9, 108, 0.5)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Animated Atlantis grid with depth effect
      const gridSize = 50
      time += 0.02

      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          const waveOffset = Math.sin(time + x * 0.01 + y * 0.01) * 10
          const opacity = 0.2 + Math.sin(time + x * 0.005 + y * 0.005) * 0.1

          ctx.strokeStyle = `rgba(157, 78, 221, ${opacity})`
          ctx.lineWidth = 1 + Math.sin(time + x * 0.01) * 0.5

          ctx.beginPath()
          ctx.moveTo(x, y + waveOffset)
          ctx.lineTo(x + gridSize, y + waveOffset)
          ctx.moveTo(x + waveOffset, y)
          ctx.lineTo(x + waveOffset, y + gridSize)
          ctx.stroke()
        }
      }

      // Floating energy orbs (representing Atlantis power sources)
      for (let i = 0; i < 15; i++) {
        const x = Math.sin(time * 0.5 + i * 0.8) * (canvas.width * 0.3) + canvas.width / 2
        const y = Math.cos(time * 0.3 + i * 0.6) * (canvas.height * 0.2) + canvas.height / 2
        const size = Math.abs(3 + Math.sin(time * 2 + i) * 2) + 1
        const pulseIntensity = 0.3 + Math.sin(time * 3 + i) * 0.2

        // Outer glow
        const orbGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
        orbGradient.addColorStop(0, `rgba(199, 125, 255, ${pulseIntensity})`)
        orbGradient.addColorStop(0.5, `rgba(157, 78, 221, ${pulseIntensity * 0.5})`)
        orbGradient.addColorStop(1, "rgba(157, 78, 221, 0)")

        ctx.fillStyle = orbGradient
        ctx.beginPath()
        ctx.arc(x, y, size * 3, 0, Math.PI * 2)
        ctx.fill()

        // Core orb
        ctx.fillStyle = `rgba(199, 125, 255, ${0.8 + pulseIntensity * 0.2})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Rising bubbles effect
      for (let i = 0; i < 25; i++) {
        const x = Math.sin(time * 0.1 + i) * 50 + (i * canvas.width) / 25
        const y = ((time * 30 + i * 100) % (canvas.height + 100)) - 50
        const size = Math.abs(1 + Math.sin(time + i) * 1.5) + 0.5
        const opacity = 0.1 + Math.sin(time * 2 + i) * 0.1

        ctx.fillStyle = `rgba(199, 125, 255, ${opacity})`
        ctx.beginPath()
        ctx.arc(x, canvas.height - y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Electric current lines (Atlantis technology)
      ctx.strokeStyle = "rgba(157, 78, 221, 0.4)"
      ctx.lineWidth = 2
      for (let i = 0; i < 8; i++) {
        const startX = Math.sin(time + i) * canvas.width * 0.1 + canvas.width * 0.1
        const startY = i * (canvas.height / 8)
        const endX = Math.cos(time + i) * canvas.width * 0.1 + canvas.width * 0.9
        const endY = startY + Math.sin(time * 2 + i) * 50

        const currentIntensity = 0.2 + Math.sin(time * 4 + i) * 0.3
        ctx.strokeStyle = `rgba(157, 78, 221, ${currentIntensity})`

        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.quadraticCurveTo(canvas.width / 2 + Math.sin(time + i) * 100, startY + Math.cos(time + i) * 30, endX, endY)
        ctx.stroke()
      }

      // Ancient gate silhouettes in the distance
      ctx.fillStyle = "rgba(60, 9, 108, 0.3)"
      const gateWidth = 120
      const gateHeight = 200
      for (let i = 0; i < 3; i++) {
        const gateX = (canvas.width / 4) * (i + 1) - gateWidth / 2
        const gateY = canvas.height - gateHeight - 50 + Math.sin(time + i) * 20

        // Gate pillars
        ctx.fillRect(gateX, gateY, 20, gateHeight)
        ctx.fillRect(gateX + gateWidth - 20, gateY, 20, gateHeight)

        // Gate arch
        ctx.beginPath()
        ctx.arc(gateX + gateWidth / 2, gateY + 20, gateWidth / 2 - 10, Math.PI, 0)
        ctx.fill()
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} />
      <div className="absolute inset-0 atlantis-grid opacity-30" style={{ zIndex: 2 }} />
      <div className="absolute inset-0 lost-city-bg" style={{ zIndex: 3 }} />

      {/* Floating bubble elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 4 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full bubble-animation"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
    </>
  )
}
