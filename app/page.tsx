"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Unlock, Zap, TrendingUp, Shield, Star } from "lucide-react"
import { GateModal } from "@/components/gate-modal"
import { CryptoStats } from "@/components/crypto-stats"
import { RetroBackground } from "@/components/retro-background"
import { CryptoWallet } from "@/components/crypto-wallet"
import { SubscriptionPlans } from "@/components/subscription-plans"
import { TransactionModal } from "@/components/transaction-modal"
import { AtlantisGate } from "@/components/atlantis-gate"
import { AtlantisPalmTree } from "@/components/atlantis-palm-tree"
import { AdminPanel } from "@/components/admin-panel"
import { MarketSignalsDisplay } from "@/components/market-signals-display"
import { DashboardBoard } from "@/components/dashboard-board"
import { RealtimePriceChart } from "@/components/realtime-price-chart"
import { AssetDetailModal } from "@/components/asset-detail-modal"
import { LiveMarketFeed } from "@/components/live-market-feed"
import { LivePriceTicker } from "@/components/live-price-ticker"
import { marketDataService, type MarketAsset } from "@/lib/market-data"
import { WalletConnector } from "@/components/wallet-connector"

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

export default function HomePage() {
  const [hasGateAccess, setHasGateAccess] = useState(false)
  const [isGateOpen, setIsGateOpen] = useState(false)
  const [showGateModal, setShowGateModal] = useState(false)
  const [userLevel, setUserLevel] = useState(1)
  const [experience, setExperience] = useState(250)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; amount: number } | null>(null)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [accessCount, setAccessCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [marketAssets, setMarketAssets] = useState<MarketAsset[]>([])

  const [marketSignals, setMarketSignals] = useState<MarketSignal[]>([
    {
      id: "1",
      symbol: "BTC",
      type: "crypto",
      status: "green",
      title: "Bitcoin Bullish Breakout",
      description: "Strong momentum above $45K resistance",
      createdAt: new Date(),
      price: "$46,250",
    },
    {
      id: "2",
      symbol: "ETH",
      type: "crypto",
      status: "red",
      title: "Ethereum Warning",
      description: "Potential correction incoming, watch support levels",
      createdAt: new Date(),
      price: "$2,890",
    },
  ])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const loadMarketData = async () => {
      console.log("[v0] Loading market data and initializing CoinGecko API")

      try {
        await marketDataService.startRealTimeUpdates()
        const assets = await marketDataService.getMarketAssets()
        setMarketAssets(assets)
      } catch (error) {
        console.error("[v0] Error initializing market data:", error)
        // Fallback to loading assets without API
        const assets = await marketDataService.getMarketAssets()
        setMarketAssets(assets)
      }
    }

    loadMarketData()

    const unsubscribe = marketDataService.subscribeToMarketAssets((assets) => {
      console.log("[v0] Market assets updated:", assets.length)
      setMarketAssets(assets)
    })

    // Clean up WebSocket connections on unmount
    return () => {
      unsubscribe()
      marketDataService.disconnectCoinGecko()
    }
  }, [])

  const handleGateAccess = () => {
    setShowGateModal(true)
  }

  const handleGateUnlock = () => {
    setHasGateAccess(true)
    setIsGateOpen(true)
    setShowGateModal(false)
    setUserLevel(2)
    setExperience(500)
    setAccessCount((prev) => prev + 1)
  }

  const handleSubscriptionPurchase = (planId: string, price: number) => {
    const planNames = {
      basic: "BASIC GATE",
      premium: "PREMIUM GATE",
      elite: "ELITE GATE",
    }
    setSelectedPlan({
      name: planNames[planId as keyof typeof planNames],
      amount: price,
    })
    setShowTransactionModal(true)
  }

  const handleTransactionSuccess = () => {
    setHasSubscription(true)
    setUserLevel((prev) => prev + 1)
    setExperience((prev) => prev + 1000)
  }

  const handleSignalUpdate = (signals: MarketSignal[]) => {
    setMarketSignals(signals)
  }

  const handleAssetClick = (symbol: string) => {
    setSelectedAsset(symbol)
    setShowAssetModal(true)
  }

  if (!hasGateAccess) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
        <RetroBackground />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8 underwater-float">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-primary rounded-full mx-auto mb-4 sm:mb-6 atlantis-glow flex items-center justify-center">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-background" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-4 sm:mb-6 text-balance hologram-effect">
              <span className="text-primary atlantis-glow">BIT</span>LANTA
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 text-pretty">
              The Lost City of Crypto Phenomena
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
              Ancient gates guard the entrance to Bitlanta, where crypto legends are born and digital treasures await.
              Only those who possess the sacred knowledge may enter.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <AtlantisGate isOpen={false} level={1} />
            <AtlantisGate isOpen={false} level={2} />
            <div className="sm:col-span-2 lg:col-span-1">
              <AtlantisGate isOpen={false} level={3} />
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleGateAccess}
            className="text-lg sm:text-xl lg:text-2xl px-8 sm:px-10 lg:px-12 py-6 sm:py-7 lg:py-8 atlantis-glow font-mono electric-current w-full sm:w-auto min-h-[60px] touch-manipulation"
          >
            <Lock className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
            AWAKEN THE ANCIENT GATES
          </Button>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
            <Card className="bg-card/60 backdrop-blur-sm border-primary/20 underwater-float">
              <CardContent className="p-4 sm:p-6 text-center">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-2 sm:mb-3 atlantis-glow" />
                <h3 className="font-mono text-xs sm:text-sm font-bold mb-1 sm:mb-2 hologram-effect">SECURE DEPTHS</h3>
                <p className="text-xs text-muted-foreground">Protected by ancient Atlantean cryptography</p>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-sm border-secondary/20 underwater-float">
              <CardContent className="p-4 sm:p-6 text-center">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-secondary mx-auto mb-2 sm:mb-3 atlantis-glow" />
                <h3 className="font-mono text-xs sm:text-sm font-bold mb-1 sm:mb-2 hologram-effect">ETHEREAL POWER</h3>
                <p className="text-xs text-muted-foreground">Harness the infinite energy of the deep</p>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-sm border-accent/20 underwater-float sm:col-span-2 lg:col-span-1">
              <CardContent className="p-4 sm:p-6 text-center">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-accent mx-auto mb-2 sm:mb-3 atlantis-glow" />
                <h3 className="font-mono text-xs sm:text-sm font-bold mb-1 sm:mb-2 hologram-effect">LEGENDARY GAINS</h3>
                <p className="text-xs text-muted-foreground">Discover treasures beyond imagination</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <GateModal isOpen={showGateModal} onClose={() => setShowGateModal(false)} onUnlock={handleGateUnlock} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <RetroBackground />

      <header className="relative z-10 border-b border-border bg-card/80 backdrop-blur-sm underwater-float">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded pixelated atlantis-glow"></div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary font-mono hologram-effect">
                BITLANTA
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {hasSubscription && (
                <Badge variant="default" className="font-mono atlantis-glow text-xs sm:text-sm px-2 py-1">
                  ATLANTEAN
                </Badge>
              )}
              <Badge variant="secondary" className="font-mono underwater-float text-xs sm:text-sm px-2 py-1">
                DEPTH {userLevel}
              </Badge>
              <div className="hidden sm:flex items-center space-x-2">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-primary atlantis-glow" />
                <span className="text-xs sm:text-sm font-mono hologram-effect">{experience} ENERGY</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        <LivePriceTicker />
      </div>

      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center mb-8 sm:mb-12 underwater-float">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 text-balance hologram-effect">
            Welcome to <span className="text-primary atlantis-glow">Bitlanta</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-xl text-muted-foreground mb-6 sm:mb-8 text-pretty max-w-2xl mx-auto px-2">
            You have successfully entered the lost city of crypto phenomena. Explore the depths, unlock mystical gates,
            and harness the power of ancient Atlantean technology.
          </p>

          <Badge
            variant="default"
            className="text-sm sm:text-base lg:text-lg px-4 sm:px-6 py-2 atlantis-glow font-mono"
          >
            <Unlock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            GATES AWAKENED - WELCOME ATLANTEAN
          </Badge>
        </div>

        <DashboardBoard
          userLevel={userLevel}
          experience={experience}
          hasSubscription={hasSubscription}
          accessCount={accessCount}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <AtlantisGate isOpen={isGateOpen} level={1} />
          <AtlantisGate isOpen={hasSubscription} level={2} />
          <div className="sm:col-span-2 lg:col-span-1">
            <AtlantisGate isOpen={userLevel >= 5} level={3} />
          </div>
        </div>

        <div className="mb-8 sm:mb-12">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 font-mono hologram-effect text-center">
            LIVE ATLANTEAN MARKETS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {marketAssets.map((asset) => (
              <RealtimePriceChart key={asset.symbol} asset={asset} onAssetClick={handleAssetClick} />
            ))}
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:gap-8">
                <CryptoWallet />
                <WalletConnector />
                <SubscriptionPlans onPurchase={handleSubscriptionPurchase} />
              </div>
              <CryptoStats isGateOpen={isGateOpen} />
            </div>

            <div className="lg:col-span-1 order-first lg:order-none">
              <LiveMarketFeed />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <MarketSignalsDisplay signals={marketSignals} />
              <AtlantisPalmTree accessCount={accessCount} />
              <AdminPanel
                isAdmin={isAdmin}
                onToggleAdmin={() => setIsAdmin(!isAdmin)}
                onSignalUpdate={handleSignalUpdate}
              />
            </div>
          </div>
        </div>
      </main>

      <GateModal isOpen={showGateModal} onClose={() => setShowGateModal(false)} onUnlock={handleGateUnlock} />

      {selectedPlan && (
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          planName={selectedPlan.name}
          amount={selectedPlan.amount}
          onSuccess={handleTransactionSuccess}
        />
      )}

      {selectedAsset && (
        <AssetDetailModal isOpen={showAssetModal} onClose={() => setShowAssetModal(false)} symbol={selectedAsset} />
      )}
    </div>
  )
}
