"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp, TrendingDown, Activity, DollarSign, Zap } from "lucide-react"

interface AssetDetailModalProps {
  isOpen: boolean
  onClose: () => void
  symbol: string
}

const assetData: Record<string, any> = {
  BTC: {
    name: "Bitcoin",
    price: 67420.5,
    change24h: 2.34,
    marketCap: 1320000000000,
    volume24h: 28500000000,
    supply: 19700000,
    maxSupply: 21000000,
    description: "The first and most valuable cryptocurrency, digital gold of Atlantis.",
  },
  ETH: {
    name: "Ethereum",
    price: 3840.25,
    change24h: -1.67,
    marketCap: 462000000000,
    volume24h: 15200000000,
    supply: 120280000,
    maxSupply: null,
    description: "Smart contract platform powering the decentralized applications of New Atlantis.",
  },
  ADA: {
    name: "Cardano",
    price: 0.4521,
    change24h: 5.23,
    marketCap: 15800000000,
    volume24h: 890000000,
    supply: 35000000000,
    maxSupply: 45000000000,
    description: "Proof-of-stake blockchain platform built for the sustainable future of Atlantis.",
  },
}

export function AssetDetailModal({ isOpen, onClose, symbol }: AssetDetailModalProps) {
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  const [timeframe, setTimeframe] = useState("24h")
  const asset = assetData[symbol]

  useEffect(() => {
    if (!asset) return

    // Generate price history data
    const generateHistory = () => {
      const points = timeframe === "24h" ? 24 : timeframe === "7d" ? 7 : 30
      const data = []
      const basePrice = asset.price

      for (let i = points; i >= 0; i--) {
        const time = timeframe === "24h" ? `${23 - i}:00` : timeframe === "7d" ? `Day ${8 - i}` : `${31 - i}/12`

        const volatility = 0.05
        const change = (Math.random() - 0.5) * volatility
        const price = basePrice * (1 + change * (i / points))

        data.push({
          time,
          price: price,
          volume: Math.random() * 1000000000,
        })
      }
      return data
    }

    setPriceHistory(generateHistory())
  }, [symbol, timeframe])

  const isPositive = asset ? asset.change24h >= 0 : false

  const handleBuyAsset = async () => {
    const connectedWallet = (window as any).connectedWallet
    const initiateWalletTransaction = (window as any).initiateWalletTransaction

    if (!connectedWallet) {
      alert("Please connect your wallet first to buy assets")
      return
    }

    if (!initiateWalletTransaction) {
      alert("Wallet transaction function not available")
      return
    }

    try {
      // Calculate purchase amount (example: 0.01 ETH worth of the asset)
      const purchaseAmount = 0.01

      if (Number.parseFloat(connectedWallet.balance) < purchaseAmount) {
        alert(`Insufficient wallet balance! Need ${purchaseAmount} ETH`)
        return
      }

      const txHash = await initiateWalletTransaction(purchaseAmount)

      if (txHash) {
        alert(`Successfully bought ${symbol}! Transaction: ${txHash.slice(0, 10)}...`)
      }
    } catch (error) {
      console.error("Buy error:", error)
      alert("Purchase failed. Please try again.")
    }
  }

  const handleSellAsset = async () => {
    alert(`Sell functionality for ${symbol} coming soon! Connect your wallet to enable trading.`)
  }

  if (!asset) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-sm border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-mono hologram-effect">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary atlantis-glow" />
            </div>
            {asset.name} ({symbol})
            <Badge variant={isPositive ? "default" : "destructive"} className="ml-auto">
              {isPositive ? "+" : ""}
              {asset.change24h.toFixed(2)}%
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Price Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card/50 p-4 rounded-lg border border-primary/20">
              <div className="text-sm text-muted-foreground">Current Price</div>
              <div className="text-2xl font-bold font-mono atlantis-glow">${asset.price.toLocaleString()}</div>
            </div>
            <div className="bg-card/50 p-4 rounded-lg border border-primary/20">
              <div className="text-sm text-muted-foreground">Market Cap</div>
              <div className="text-xl font-mono">${(asset.marketCap / 1e9).toFixed(1)}B</div>
            </div>
            <div className="bg-card/50 p-4 rounded-lg border border-primary/20">
              <div className="text-sm text-muted-foreground">24h Volume</div>
              <div className="text-xl font-mono">${(asset.volume24h / 1e9).toFixed(1)}B</div>
            </div>
            <div className="bg-card/50 p-4 rounded-lg border border-primary/20">
              <div className="text-sm text-muted-foreground">Supply</div>
              <div className="text-xl font-mono">{(asset.supply / 1e6).toFixed(1)}M</div>
            </div>
          </div>

          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chart">Price Chart</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="space-y-4">
              <div className="flex gap-2">
                {["24h", "7d", "30d"].map((tf) => (
                  <Button
                    key={tf}
                    variant={timeframe === tf ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeframe(tf)}
                    className="font-mono"
                  >
                    {tf}
                  </Button>
                ))}
              </div>

              <div className="h-64 w-full bg-card/30 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceHistory}>
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={isPositive ? "#10b981" : "#ef4444"}
                      fill={isPositive ? "#10b98120" : "#ef444420"}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Trading Activity</span>
                  </div>
                  <div className="text-2xl font-mono atlantis-glow">High</div>
                </div>
                <div className="bg-card/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Volatility</span>
                  </div>
                  <div className="text-2xl font-mono atlantis-glow">{Math.abs(asset.change24h).toFixed(1)}%</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="about" className="space-y-4">
              <div className="bg-card/30 p-6 rounded-lg">
                <p className="text-muted-foreground leading-relaxed">{asset.description}</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2">
            <Button className="flex-1 font-mono" onClick={handleBuyAsset}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Buy {symbol}
            </Button>
            <Button variant="outline" className="flex-1 font-mono bg-transparent" onClick={handleSellAsset}>
              <TrendingDown className="h-4 w-4 mr-2" />
              Sell {symbol}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
