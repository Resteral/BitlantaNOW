"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

interface AtlantisGateProps {
  isOpen: boolean
  level: number
}

export function AtlantisGate({ isOpen, level, price, tierName, onPurchase }: AtlantisGateProps & { price?: number, tierName?: string, onPurchase?: () => void }) {
  const [pulseIntensity, setPulseIntensity] = useState(0.5)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIntensity(Math.random() * 0.5 + 0.3)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="relative overflow-hidden bg-card/20 backdrop-blur-sm border-primary/30 underwater-float">
      <div className="relative h-64 flex items-center justify-center">
        {/* Gate structure */}
        <div className="relative">
          {/* Left pillar */}
          <div className="absolute left-0 top-0 w-8 h-48 bg-gradient-to-b from-primary via-secondary to-primary/50 atlantis-glow" />

          {/* Right pillar */}
          <div className="absolute right-0 top-0 w-8 h-48 bg-gradient-to-b from-primary via-secondary to-primary/50 atlantis-glow" />

          {/* Gate arch */}
          <div className="w-32 h-16 border-8 border-primary rounded-t-full relative top-0 atlantis-glow">
            <div className="absolute inset-2 bg-gradient-to-b from-primary/30 to-transparent rounded-t-full" />
          </div>

          {/* Energy field in gate opening */}
          <div className="absolute top-16 left-8 right-8 bottom-8 flex items-center justify-center">
            {isOpen ? (
              <div className="w-full h-full bg-gradient-to-b from-accent/50 via-primary/30 to-secondary/50 electric-current rounded hologram-effect">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl font-mono text-white/90 hologram-effect">LEVEL {level}</div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-muted/50 via-border/30 to-muted/50 gate-shimmer rounded group cursor-pointer" onClick={onPurchase}>
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 p-2 text-center transition-transform duration-300 group-hover:scale-105">
                  <div className="text-lg font-mono text-muted-foreground/70 group-hover:text-primary transition-colors">LOCKED</div>
                  {price && (
                    <>
                      <div className="text-sm font-bold text-primary font-mono atlantis-glow">${price}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Unlock {tierName}</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ancient symbols on pillars */}
          <div className="absolute left-2 top-4 text-xs font-mono text-primary/70 writing-mode-vertical hologram-effect">
            ⟨⟩◊⟨⟩
          </div>
          <div className="absolute right-2 top-4 text-xs font-mono text-primary/70 writing-mode-vertical hologram-effect">
            ◊⟨⟩◊⟨
          </div>
        </div>

        {/* Energy particles around gate */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-accent rounded-full underwater-float"
              style={{
                left: `${20 + Math.sin(i) * 60}%`,
                top: `${30 + Math.cos(i) * 40}%`,
                animationDelay: `${i * 0.5}s`,
                opacity: pulseIntensity,
              }}
            />
          ))}
        </div>
      </div>

      {/* Gate status indicator */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground">ATLANTIS GATE</span>
          <span className={`${isOpen ? "text-accent" : "text-muted-foreground"} hologram-effect`}>
            {isOpen ? "ACTIVE" : "DORMANT"}
          </span>
        </div>
      </div>
    </Card>
  )
}
