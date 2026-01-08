"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Lock } from "lucide-react"

interface CryptoStatsProps {
  isGateOpen: boolean
}

export function CryptoStats({ isGateOpen }: CryptoStatsProps) {
  const cryptoData = [
    { name: "RETROCOIN", symbol: "RTC", price: "$1,337.00", change: "+12.5%", trend: "up" },
    { name: "GATECOIN", symbol: "GTC", price: "$420.69", change: "+8.2%", trend: "up" },
    { name: "PIXELCOIN", symbol: "PXL", price: "$88.88", change: "-2.1%", trend: "down" },
    { name: "NEONTOKEN", symbol: "NEON", price: "$256.00", change: "+15.7%", trend: "up" },
  ]

  const premiumData = [
    { name: "ELITECOIN", symbol: "ELITE", price: "$9,001.00", change: "+25.3%", trend: "up" },
    { name: "VIPTOKEN", symbol: "VIP", price: "$5,555.55", change: "+18.9%", trend: "up" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl sm:text-2xl font-bold mb-4 font-mono text-primary">CRYPTO MARKET</h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {cryptoData.map((crypto) => (
            <Card key={crypto.symbol} className="bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-mono">{crypto.symbol}</CardTitle>
                <CardDescription className="text-xs hidden sm:block">{crypto.name}</CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-sm sm:text-lg font-bold font-mono">{crypto.price}</span>
                  <Badge
                    variant={crypto.trend === "up" ? "default" : "destructive"}
                    className="text-xs font-mono w-fit"
                  >
                    {crypto.trend === "up" ? (
                      <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                    )}
                    {crypto.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Premium Section */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <h3 className="text-xl sm:text-2xl font-bold font-mono text-secondary">PREMIUM MARKET</h3>
          {!isGateOpen && <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />}
        </div>

        {isGateOpen ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            {premiumData.map((crypto) => (
              <Card key={crypto.symbol} className="bg-card/80 backdrop-blur-sm border-secondary/20 retro-glow">
                <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-4">
                  <CardTitle className="text-xs sm:text-sm font-mono text-secondary">{crypto.symbol}</CardTitle>
                  <CardDescription className="text-xs hidden sm:block">{crypto.name}</CardDescription>
                </CardHeader>
                <CardContent className="p-2 sm:p-4 pt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm sm:text-lg font-bold font-mono">{crypto.price}</span>
                    <Badge variant="default" className="text-xs font-mono bg-secondary w-fit">
                      <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                      {crypto.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumData.map((crypto) => (
              <Card key={crypto.symbol} className="bg-card/40 backdrop-blur-sm border-dashed opacity-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono blur-sm">{crypto.symbol}</CardTitle>
                  <CardDescription className="text-xs blur-sm">{crypto.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-8">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground ml-2 font-mono">LOCKED</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
