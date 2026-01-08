"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TreePine, Users, Sparkles } from "lucide-react"

interface AtlantisPalmTreeProps {
  accessCount: number
}

export function AtlantisPalmTree({ accessCount }: AtlantisPalmTreeProps) {
  const [animateGrowth, setAnimateGrowth] = useState(false)

  useEffect(() => {
    if (accessCount > 0) {
      setAnimateGrowth(true)
      const timer = setTimeout(() => setAnimateGrowth(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [accessCount])

  const treeHeight = Math.min(200 + accessCount * 15, 400)
  const trunkHeight = Math.min(60 + accessCount * 5, 120)
  const palmCount = Math.min(3 + Math.floor(accessCount / 3), 12)

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20 underwater-float h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 font-mono hologram-effect text-sm">
          <TreePine className="w-4 h-4 text-primary atlantis-glow" />
          <span>ATLANTEAN PALM</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="font-mono text-xs">
            <Users className="w-3 h-3 mr-1" />
            {accessCount} AWAKENED
          </Badge>
          <Badge variant="outline" className="font-mono text-xs atlantis-glow">
            <Sparkles className="w-3 h-3 mr-1" />
            GROWING
          </Badge>
        </div>

        {/* Palm Tree Visualization */}
        <div className="relative flex justify-center items-end h-64 bg-gradient-to-t from-primary/10 to-transparent rounded-lg overflow-hidden">
          {/* Ocean Floor */}
          <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-primary/30 to-primary/10 rounded-b-lg"></div>

          {/* Tree Trunk */}
          <div
            className={`relative bg-gradient-to-r from-amber-700 to-amber-600 rounded-t-lg transition-all duration-2000 ${
              animateGrowth ? "animate-pulse" : ""
            }`}
            style={{
              width: "12px",
              height: `${trunkHeight}px`,
              boxShadow: "0 0 10px rgba(168, 85, 247, 0.3)",
            }}
          >
            {/* Tree Rings */}
            {Array.from({ length: Math.floor(accessCount / 2) }).map((_, i) => (
              <div key={i} className="absolute w-full h-0.5 bg-amber-800/50" style={{ top: `${(i + 1) * 15}px` }} />
            ))}
          </div>

          {/* Palm Fronds */}
          <div className="absolute" style={{ bottom: `${trunkHeight - 10}px` }}>
            {Array.from({ length: palmCount }).map((_, i) => {
              const angle = (360 / palmCount) * i
              const length = 30 + accessCount * 2
              return (
                <div
                  key={i}
                  className={`absolute origin-bottom bg-gradient-to-t from-green-600 to-green-400 rounded-full transition-all duration-2000 ${
                    animateGrowth ? "animate-bounce" : ""
                  }`}
                  style={{
                    width: "4px",
                    height: `${Math.min(length, 60)}px`,
                    transform: `rotate(${angle}deg) translateY(-50%)`,
                    boxShadow: "0 0 8px rgba(34, 197, 94, 0.4)",
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              )
            })}
          </div>

          {/* Floating Energy Particles */}
          {Array.from({ length: Math.min(accessCount, 8) }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full atlantis-glow animate-ping"
              style={{
                left: `${20 + i * 10}%`,
                bottom: `${60 + i * 15}px`,
                animationDelay: `${i * 500}ms`,
                animationDuration: "2s",
              }}
            />
          ))}
        </div>

        {/* Growth Stats */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Height:</span>
            <span className="font-mono text-primary atlantis-glow">{treeHeight}px</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fronds:</span>
            <span className="font-mono text-secondary atlantis-glow">{palmCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Energy:</span>
            <span className="font-mono text-accent atlantis-glow">{accessCount * 100} ATL</span>
          </div>
        </div>

        {accessCount === 0 && (
          <div className="text-center text-xs text-muted-foreground italic">
            The ancient palm awaits the first awakening...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
