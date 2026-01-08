"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Zap, Activity } from "lucide-react"
import { marketDataService, type MarketAsset } from "@/lib/market-data"

interface TickerItem extends MarketAsset {
  signal?: "strong_buy" | "buy" | "sell" | "strong_sell" | null
  signalStrength?: number
}

export function LivePriceTicker() {
  const [tickerData, setTickerData] = useState<TickerItem[]>([])
  const [isScrolling, setIsScrolling] = useState(true)

  useEffect(() => {
    const loadTickerData = async () => {
      const assets = await marketDataService.getMarketAssets()

      // Add simulated signals based on price changes
      const tickerItems: TickerItem[] = assets.map((asset) => {
        const changePercent = Number.parseFloat(asset.change_24h.toString())
        let signal: TickerItem["signal"] = null
        let signalStrength = 0

        if (changePercent > 5) {
          signal = "strong_buy"
          signalStrength = Math.min(100, Math.abs(changePercent) * 10)
        } else if (changePercent > 2) {
          signal = "buy"
          signalStrength = Math.min(100, Math.abs(changePercent) * 15)
        } else if (changePercent < -5) {
          signal = "strong_sell"
          signalStrength = Math.min(100, Math.abs(changePercent) * 10)
        } else if (changePercent < -2) {
          signal = "sell"
          signalStrength = Math.min(100, Math.abs(changePercent) * 15)
        }

        return {
          ...asset,
          signal,
          signalStrength,
        }
      })

      setTickerData(tickerItems)
    }

    loadTickerData()

    const unsubscribe = marketDataService.subscribeToMarketAssets((assets) => {
      const tickerItems: TickerItem[] = assets.map((asset) => {
        const changePercent = Number.parseFloat(asset.change_24h.toString())
        let signal: TickerItem["signal"] = null
        let signalStrength = 0

        if (changePercent > 5) {
          signal = "strong_buy"
          signalStrength = Math.min(100, Math.abs(changePercent) * 10)
        } else if (changePercent > 2) {
          signal = "buy"
          signalStrength = Math.min(100, Math.abs(changePercent) * 15)
        } else if (changePercent < -5) {
          signal = "strong_sell"
          signalStrength = Math.min(100, Math.abs(changePercent) * 10)
        } else if (changePercent < -2) {
          signal = "sell"
          signalStrength = Math.min(100, Math.abs(changePercent) * 15)
        }

        return {
          ...asset,
          signal,
          signalStrength,
        }
      })

      setTickerData(tickerItems)
    })

    return unsubscribe
  }, [])

  const getSignalColor = (signal: TickerItem["signal"]) => {
    switch (signal) {
      case "strong_buy":
        return "text-green-400 bg-green-500/20 border-green-500/50"
      case "buy":
        return "text-green-300 bg-green-500/10 border-green-500/30"
      case "sell":
        return "text-red-300 bg-red-500/10 border-red-500/30"
      case "strong_sell":
        return "text-red-400 bg-red-500/20 border-red-500/50"
      default:
        return "text-muted-foreground bg-card/20 border-border/30"
    }
  }

  const getSignalIcon = (signal: TickerItem["signal"]) => {
    switch (signal) {
      case "strong_buy":
        return <TrendingUp className="w-3 h-3 animate-pulse" />
      case "buy":
        return <TrendingUp className="w-3 h-3" />
      case "sell":
        return <TrendingDown className="w-3 h-3" />
      case "strong_sell":
        return <TrendingDown className="w-3 h-3 animate-pulse" />
      default:
        return <Activity className="w-3 h-3" />
    }
  }

  const getSignalText = (signal: TickerItem["signal"]) => {
    switch (signal) {
      case "strong_buy":
        return "STRONG BUY"
      case "buy":
        return "BUY"
      case "sell":
        return "SELL"
      case "strong_sell":
        return "STRONG SELL"
      default:
        return "NEUTRAL"
    }
  }

  return (
    <div className="w-full bg-card/90 backdrop-blur-sm border-y border-primary/30 py-2 overflow-hidden relative">
      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary atlantis-glow animate-pulse" />
          <span className="text-sm font-mono font-bold hologram-effect text-primary">
            LIVE ATLANTEAN MARKET SIGNALS
          </span>
        </div>
        <Badge
          variant="outline"
          className="text-xs font-mono cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={() => setIsScrolling(!isScrolling)}
        >
          {isScrolling ? "SCROLLING" : "PAUSED"}
        </Badge>
      </div>

      <div className="relative overflow-hidden">
        <div
          className={`flex gap-4 ${isScrolling ? "animate-scroll" : ""}`}
          style={{
            width: `${tickerData.length * 280}px`,
            animationDuration: `${tickerData.length * 8}s`,
          }}
        >
          {/* Duplicate items for seamless scrolling */}
          {[...tickerData, ...tickerData].map((item, index) => {
            const isPositive = Number.parseFloat(item.change_24h.toString()) >= 0
            const hasSignal = item.signal && item.signal !== null

            return (
              <div
                key={`${item.symbol}-${index}`}
                className={`flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-lg border transition-all duration-300 ${
                  hasSignal
                    ? `${getSignalColor(item.signal)} atlantis-glow ${item.signal?.includes("strong") ? "animate-pulse" : ""}`
                    : "bg-card/40 border-border/20 hover:border-primary/30"
                }`}
              >
                {/* Asset Info */}
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono font-bold">{item.symbol}</code>
                  <div className="text-sm font-mono">
                    $
                    {Number.parseFloat(item.current_price.toString()).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>

                {/* Price Change */}
                <div
                  className={`flex items-center gap-1 text-sm font-mono ${
                    isPositive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isPositive ? "+" : ""}
                  {Number.parseFloat(item.change_24h.toString()).toFixed(2)}%
                </div>

                {/* Signal Badge */}
                {hasSignal && (
                  <div className="flex items-center gap-1">
                    {getSignalIcon(item.signal)}
                    <span className="text-xs font-mono font-bold">{getSignalText(item.signal)}</span>
                    {item.signalStrength && item.signalStrength > 50 && (
                      <div className="w-1 h-1 rounded-full bg-current animate-ping" />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll linear infinite;
        }
      `}</style>
    </div>
  )
}
