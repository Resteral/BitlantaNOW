import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const revalidate = 0

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const coinGeckoToSymbolMap: Record<string, string> = {
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

export async function GET(request: NextRequest) {
  console.log("[v0] CoinGecko API route called")

  try {
    const coingeckoIds = [
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

    const idsParam = coingeckoIds.join(",")
    const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`

    console.log("[v0] Fetching from CoinGecko API")

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const marketResponse = await fetch(apiUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Bitlanta-App/1.0",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("[v0] CoinGecko response status:", marketResponse.status)

      if (!marketResponse.ok) {
        const errorText = await marketResponse.text()
        console.error("[v0] CoinGecko error response:", errorText)
        throw new Error(`CoinGecko API error: ${marketResponse.status}`)
      }

      const marketData = await marketResponse.json()
      console.log("[v0] CoinGecko data received:", marketData.length, "coins")

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        console.log("[v0] Updating database with CoinGecko data")

        const updateResults = []

        for (const coin of marketData) {
          try {
            const symbol = coinGeckoToSymbolMap[coin.id]
            if (!symbol) {
              console.warn(`[v0] No symbol mapping for ${coin.id}`)
              continue
            }

            const price = coin.current_price
            const changePercent = coin.price_change_percentage_24h || 0
            const volume = coin.total_volume || 0

            // Update market asset
            const { error: updateError } = await supabase
              .from("market_assets")
              .update({
                current_price: price,
                change_24h: changePercent,
                volume_24h: volume,
                market_cap: coin.market_cap,
                last_updated: new Date().toISOString(),
              })
              .eq("symbol", symbol)

            if (updateError) {
              console.error(`[v0] Error updating ${symbol}:`, updateError.message)
              updateResults.push({ symbol, success: false, error: updateError.message })
              continue
            }

            console.log(`[v0] Updated ${symbol}: $${price}`)
            updateResults.push({ symbol, success: true, price })

            // Get asset ID for price history
            const { data: assetData, error: fetchError } = await supabase
              .from("market_assets")
              .select("id")
              .eq("symbol", symbol)
              .maybeSingle()

            if (fetchError || !assetData) {
              console.warn(`[v0] Asset ${symbol} not found in database`)
              continue
            }

            // Add price history
            const { error: historyError } = await supabase.from("price_history").insert({
              asset_id: assetData.id,
              price: price,
              volume: volume,
              timestamp: new Date().toISOString(),
            })

            if (historyError) {
              console.error(`[v0] Error adding price history for ${symbol}:`, historyError.message)
            }

            // Create market update for significant changes
            if (Math.abs(changePercent) > 2) {
              await supabase.from("market_updates").insert({
                symbol,
                type: "price",
                message: `${symbol} ${changePercent > 0 ? "surged" : "dropped"} ${Math.abs(changePercent).toFixed(2)}%`,
                change_percent: changePercent,
                created_at: new Date().toISOString(),
                is_active: true,
              })
            }
          } catch (error: any) {
            console.error(`[v0] Error processing ${coin.id}:`, error.message)
            updateResults.push({ symbol: coin.symbol, success: false, error: error.message })
          }
        }

        console.log("[v0] Database update complete:", updateResults.length, "coins processed")
      }

      // Transform data for client
      const transformedData = marketData.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h || 0,
        total_volume: coin.total_volume || 0,
        market_cap: coin.market_cap,
        last_updated: new Date().toISOString(),
      }))

      console.log("[v0] Returning transformed data")

      return Response.json(
        {
          success: true,
          data: transformedData,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      )
    } catch (fetchError: any) {
      clearTimeout(timeoutId)

      if (fetchError.name === "AbortError") {
        console.error("[v0] CoinGecko request timeout")
        throw new Error("CoinGecko API request timeout")
      }
      throw fetchError
    }
  } catch (error: any) {
    console.error("[v0] CoinGecko API route error:", error)
    return Response.json(
      {
        success: false,
        error: error.message || "Failed to fetch market data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
