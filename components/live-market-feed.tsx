"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, TrendingUp, TrendingDown, Zap } from "lucide-react"
import { marketDataService, type MarketUpdate } from "@/lib/market-data"

export function LiveMarketFeed() {
  const [updates, setUpdates] = useState<MarketUpdate[]>([])

  useEffect(() => {
    const loadMarketUpdates = async () => {
      const marketUpdates = await marketDataService.getMarketUpdates()
      setUpdates(marketUpdates)
    }

    loadMarketUpdates()

    const unsubscribe = marketDataService.subscribeToMarketUpdates((marketUpdates) => {
      setUpdates(marketUpdates)
    })

    return unsubscribe
  }, [])

  const getUpdateIcon = (type: MarketUpdate["type"]) => {
    switch (type) {
      case "price":
        return <TrendingUp className="h-3 w-3" />
      case "volume":
        return <Activity className="h-3 w-3" />
      case "news":
        return <Zap className="h-3 w-3" />
      case "alert":
        return <TrendingDown className="h-3 w-3" />
    }
  }

  const getUpdateColor = (type: MarketUpdate["type"]) => {
    switch (type) {
      case "price":
        return "text-green-400"
      case "volume":
        return "text-blue-400"
      case "news":
        return "text-purple-400"
      case "alert":
        return "text-orange-400"
    }
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/30 underwater-float">
      <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
        <CardTitle className="text-sm sm:text-lg font-mono hologram-effect flex items-center gap-2">
          <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary atlantis-glow animate-pulse" />
          LIVE MARKET FEED
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <ScrollArea className="h-48 sm:h-64">
          <div className="space-y-2 sm:space-y-3">
            {updates.map((update) => (
              <div
                key={update.id}
                className="flex items-start gap-2 sm:gap-3 p-2 rounded-lg bg-card/30 border border-primary/10 hover:border-primary/30 transition-all duration-300"
              >
                <div className={`mt-1 ${getUpdateColor(update.type)} atlantis-glow`}>{getUpdateIcon(update.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    <Badge variant="outline" className="text-xs font-mono">
                      {update.symbol}
                    </Badge>
                    <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                      {update.type.toUpperCase()}
                    </Badge>
                    {update.change_percent && (
                      <span
                        className={`text-xs font-mono ${Number.parseFloat(update.change_percent.toString()) >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {Number.parseFloat(update.change_percent.toString()) >= 0 ? "+" : ""}
                        {Number.parseFloat(update.change_percent.toString()).toFixed(2)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{update.message}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {new Date(update.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
