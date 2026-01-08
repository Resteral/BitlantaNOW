"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertTriangle, DollarSign, Bitcoin } from "lucide-react"

interface MarketSignal {
  id: string
  symbol: string
  type: "crypto" | "stock"
  status: "green" | "red"
  title: string
  description: string
  createdAt: Date
  price?: string
}

interface MarketSignalsDisplayProps {
  signals: MarketSignal[]
}

export function MarketSignalsDisplay({ signals }: MarketSignalsDisplayProps) {
  const greenSignals = signals.filter((s) => s.status === "green")
  const redSignals = signals.filter((s) => s.status === "red")

  return (
    <div className="space-y-4">
      {/* Green Light Signals */}
      {greenSignals.length > 0 && (
        <Card className="bg-green-500/10 border-green-500/30 underwater-float">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 font-mono text-sm">
              <TrendingUp className="w-4 h-4 text-green-400 atlantis-glow" />
              <span className="hologram-effect text-green-400">GREEN LIGHTS</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {greenSignals.map((signal) => (
              <div key={signal.id} className="p-2 bg-background/20 rounded border border-green-500/20">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {signal.type === "crypto" ? (
                      <Bitcoin className="w-3 h-3 text-green-400" />
                    ) : (
                      <DollarSign className="w-3 h-3 text-green-400" />
                    )}
                    <code className="text-xs font-mono font-bold text-green-400 atlantis-glow">{signal.symbol}</code>
                    {signal.price && <span className="text-xs font-mono text-green-300">{signal.price}</span>}
                  </div>
                  <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                    {signal.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs font-semibold text-green-300 mb-1">{signal.title}</div>
                <div className="text-xs text-green-200/80">{signal.description}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Red Alert Signals */}
      {redSignals.length > 0 && (
        <Card className="bg-red-500/10 border-red-500/30 underwater-float">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 font-mono text-sm">
              <AlertTriangle className="w-4 h-4 text-red-400 atlantis-glow animate-pulse" />
              <span className="hologram-effect text-red-400">RED ALERTS</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {redSignals.map((signal) => (
              <div key={signal.id} className="p-2 bg-background/20 rounded border border-red-500/20">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {signal.type === "crypto" ? (
                      <Bitcoin className="w-3 h-3 text-red-400" />
                    ) : (
                      <DollarSign className="w-3 h-3 text-red-400" />
                    )}
                    <code className="text-xs font-mono font-bold text-red-400 atlantis-glow">{signal.symbol}</code>
                    {signal.price && <span className="text-xs font-mono text-red-300">{signal.price}</span>}
                  </div>
                  <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">
                    {signal.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs font-semibold text-red-300 mb-1">{signal.title}</div>
                <div className="text-xs text-red-200/80">{signal.description}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {signals.length === 0 && (
        <Card className="bg-card/50 border-border/30">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-mono">No market signals active</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
