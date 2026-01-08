"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { marketDataService, type MarketAsset, type PriceHistory } from "@/lib/market-data"

interface RealtimePriceChartProps {
  asset: MarketAsset
  onAssetClick?: (symbol: string) => void
}

export function RealtimePriceChart({ asset, onAssetClick }: RealtimePriceChartProps) {
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([])
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    const loadPriceHistory = async () => {
      const history = await marketDataService.getPriceHistory(asset.id)
      setPriceHistory(history)
    }

    loadPriceHistory()

    const unsubscribe = marketDataService.subscribeToPriceHistory(asset.id, (history) => {
      setPriceHistory(history)
    })

    return unsubscribe
  }, [asset.id])

  const isPositive = asset.change_24h >= 0

  const chartData = priceHistory.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }),
    price: Number.parseFloat(item.price.toString()),
    volume: Number.parseFloat(item.volume.toString()),
  }))

  return (
    <Card
      className="bg-card/80 backdrop-blur-sm border-primary/30 underwater-float cursor-pointer hover:border-primary/50 transition-all duration-300"
      onClick={() => onAssetClick?.(asset.symbol)}
    >
      <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm sm:text-lg font-mono hologram-effect">{asset.symbol}</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{asset.name}</p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Badge variant={isLive ? "default" : "secondary"} className="animate-pulse text-xs">
              {isLive ? "LIVE" : "OFF"}
            </Badge>
            {isPositive ? (
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 atlantis-glow" />
            ) : (
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-400 atlantis-glow" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <div className="text-lg sm:text-2xl font-bold font-mono atlantis-glow">
            $
            {Number.parseFloat(asset.current_price.toString()).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className={`text-xs sm:text-sm font-mono ${isPositive ? "text-green-400" : "text-red-400"}`}>
            {isPositive ? "+" : ""}
            {Number.parseFloat(asset.change_24h.toString()).toFixed(2)}%
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="h-16 sm:h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="time" hide />
                <YAxis domain={["dataMin - 50", "dataMax + 50"]} hide />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "#10b981" : "#ef4444"}
                  strokeWidth={2}
                  dot={false}
                  className="atlantis-glow"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-2 hidden sm:block">
          Vol: ${Number.parseFloat(asset.volume_24h.toString()).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      </CardContent>
    </Card>
  )
}
