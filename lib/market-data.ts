import { createClient } from "@/lib/supabase/client"

export interface MarketAsset {
  id: string
  symbol: string
  name: string
  current_price: number
  change_24h: number
  volume_24h: number
  market_cap?: number
  last_updated: string
  is_active: boolean
}

export interface PriceHistory {
  id: string
  asset_id: string
  price: number
  volume: number
  timestamp: string
}

export interface MarketUpdate {
  id: string
  symbol: string
  type: "price" | "volume" | "news" | "alert"
  message: string
  change_percent?: number
  created_at: string
}

interface CoinGeckoMarketData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  total_volume: number
  market_cap: number
  last_updated: string
}

export class MarketDataService {
  private updateInterval: NodeJS.Timeout | null = null
  private isConnected = false
  private isBuildTime =
    typeof window === "undefined" && process.env.NODE_ENV === "production" && !process.env.VERCEL_URL

  private readonly VERSION = "2.0.0"

  private coinGeckoToSymbolMap: Record<string, string> = {
    bitcoin: "BTC",
    ethereum: "ETH",
    binancecoin: "BNB",
    cardano: "ADA",
    solana: "SOL",
    ripple: "XRP",
    polkadot: "DOT",
    dogecoin: "DOGE",
    "avalanche-2": "AVAX",
    "matic-network": "MATIC",
  }

  private coingeckoIds = [
    "bitcoin",
    "ethereum",
    "binancecoin",
    "cardano",
    "solana",
    "ripple",
    "polkadot",
    "dogecoin",
    "avalanche-2",
    "matic-network",
  ]

  private getSupabase() {
    return createClient()
  }

  async getMarketAssets(): Promise<MarketAsset[]> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from("market_assets")
      .select("*")
      .eq("is_active", true)
      .order("market_cap", { ascending: false })

    if (error) {
      console.error("Error fetching market assets:", error)
      return []
    }

    return data || []
  }

  async getPriceHistory(assetId: string, limit = 30): Promise<PriceHistory[]> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from("price_history")
      .select("*")
      .eq("asset_id", assetId)
      .order("timestamp", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching price history:", error)
      return []
    }

    return (data || []).reverse() // Reverse to get chronological order
  }

  async getMarketUpdates(limit = 20): Promise<MarketUpdate[]> {
    const supabase = this.getSupabase()
    const { data, error } = await supabase
      .from("market_updates")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching market updates:", error)
      return []
    }

    return data || []
  }

  subscribeToMarketAssets(callback: (assets: MarketAsset[]) => void) {
    const supabase = this.getSupabase()
    const channel = supabase
      .channel("market_assets_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "market_assets",
        },
        async () => {
          const assets = await this.getMarketAssets()
          callback(assets)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  subscribeToMarketUpdates(callback: (updates: MarketUpdate[]) => void) {
    const supabase = this.getSupabase()
    const channel = supabase
      .channel("market_updates_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "market_updates",
        },
        async () => {
          const updates = await this.getMarketUpdates()
          callback(updates)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  subscribeToPriceHistory(assetId: string, callback: (history: PriceHistory[]) => void) {
    const supabase = this.getSupabase()
    const channel = supabase
      .channel(`price_history_${assetId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "price_history",
          filter: `asset_id=eq.${assetId}`,
        },
        async () => {
          const history = await this.getPriceHistory(assetId)
          callback(history)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async connectToCoinGecko(): Promise<void> {
    if (this.isBuildTime) {
      console.log("[v0] Skipping CoinGecko connection during build time")
      return
    }

    console.log("[v0] Connecting to CoinGecko API")

    try {
      // Initial fetch
      await this.fetchCoinGeckoData()
      this.isConnected = true

      // Set up polling every 60 seconds (CoinGecko rate limit friendly)
      this.updateInterval = setInterval(async () => {
        try {
          await this.fetchCoinGeckoData()
        } catch (error) {
          console.error("[v0] Error in CoinGecko polling:", error)
        }
      }, 60000)

      console.log("[v0] CoinGecko polling started successfully")
    } catch (error) {
      console.error("[v0] Error connecting to CoinGecko:", error)
      this.isConnected = false
      // Fallback to simulation
      this.startPriceSimulation()
    }
  }

  private async fetchCoinGeckoData(): Promise<void> {
    try {
      console.log("[v0] Fetching live CoinGecko prices")

      const apiUrl = `/api/coingecko-data?v=${this.VERSION}`
      console.log("[v0] Calling API:", apiUrl)

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        cache: "no-store",
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] API error response:", errorText)
        throw new Error(`API response error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log("[v0] API result:", result.success ? "success" : "failed")

      if (!result.success) {
        throw new Error(result.error || "Unknown API error")
      }

      console.log("[v0] CoinGecko data processed successfully")
    } catch (error: any) {
      console.error("[v0] CoinGecko API error:", error.message || error)

      if (!this.updateInterval) {
        console.log("[v0] Falling back to simulation mode")
        this.startPriceSimulation()
      }
    }
  }

  private startPriceSimulation(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    console.log("[v0] Starting fallback simulation mode")
    this.simulateMarketData()
    this.updateInterval = setInterval(async () => {
      try {
        await this.simulateMarketData()
      } catch (error) {
        console.error("[v0] Error in market simulation:", error)
      }
    }, 15000)
  }

  private async simulateMarketData(): Promise<void> {
    const supabase = this.getSupabase()
    try {
      const { error } = await supabase.rpc("simulate_market_data")

      if (error) {
        console.error("[v0] Error simulating market data:", error)
      } else {
        console.log("[v0] Market data simulation completed successfully")
      }
    } catch (error) {
      console.error("[v0] Error simulating market data:", error)
    }
  }

  disconnectCoinGecko(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
      console.log("[v0] CoinGecko polling stopped")
    }

    this.isConnected = false
  }

  async initialize(): Promise<void> {
    if (this.isBuildTime) {
      console.log("[v0] Skipping MarketDataService initialization during build time")
      return
    }

    console.log("[v0] Initializing MarketDataService with CoinGecko API")
    await this.connectToCoinGecko()
  }

  async startRealTimeUpdates(): Promise<void> {
    if (this.isBuildTime) {
      console.log("[v0] Skipping real-time updates during build time")
      return
    }

    await this.initialize()
  }
}

export const marketDataService = new MarketDataService()
