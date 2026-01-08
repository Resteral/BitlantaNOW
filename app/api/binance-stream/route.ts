import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  if (typeof window === "undefined" && process.env.NODE_ENV === "production" && !process.env.VERCEL_URL) {
    return new Response("Build time - WebSocket not available", { status: 503 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      console.log("[v0] Starting Binance WebSocket stream")

      // Binance WebSocket URLs
      const tickerUrl = "wss://stream.binance.com:9443/ws/!ticker@arr"
      const symbols = [
        "BTCUSDT",
        "ETHUSDT",
        "BNBUSDT",
        "ADAUSDT",
        "SOLUSDT",
        "XRPUSDT",
        "DOTUSDT",
        "DOGEUSDT",
        "AVAXUSDT",
        "MATICUSDT",
      ]

      let tickerWs: WebSocket | null = null
      const klineConnections: WebSocket[] = []

      if (typeof WebSocket === "undefined") {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", message: "WebSocket not available" })}\\n\\n`),
        )
        return
      }

      // Connect to ticker stream
      try {
        tickerWs = new WebSocket(tickerUrl)

        tickerWs.onopen = () => {
          console.log("[v0] Binance ticker WebSocket connected")
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "connection", status: "connected" })}\\n\\n`),
          )
        }

        tickerWs.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (Array.isArray(data)) {
              // Filter for our symbols
              const relevantTickers = data.filter((ticker: any) => symbols.includes(ticker.s))

              if (relevantTickers.length > 0) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "ticker",
                      data: relevantTickers,
                    })}\\n\\n`,
                  ),
                )
              }
            }
          } catch (error) {
            console.error("[v0] Error parsing ticker data:", error)
          }
        }

        tickerWs.onerror = (error) => {
          console.error("[v0] Binance ticker WebSocket error:", error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: "Ticker connection error",
              })}\\n\\n`,
            ),
          )
        }

        tickerWs.onclose = () => {
          console.log("[v0] Binance ticker WebSocket closed")
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "connection",
                status: "disconnected",
              })}\\n\\n`,
            ),
          )
        }
      } catch (error) {
        console.error("[v0] Error creating ticker WebSocket:", error)
      }

      // Connect to individual kline streams
      symbols.forEach((symbol) => {
        try {
          const klineUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1m`
          const ws = new WebSocket(klineUrl)

          ws.onopen = () => {
            console.log(`[v0] ${symbol} kline WebSocket connected`)
          }

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data)
              if (data.k) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "kline",
                      symbol: data.s,
                      data: data.k,
                    })}\\n\\n`,
                  ),
                )
              }
            } catch (error) {
              console.error(`[v0] Error parsing ${symbol} kline data:`, error)
            }
          }

          ws.onerror = (error) => {
            console.error(`[v0] ${symbol} kline WebSocket error:`, error)
          }

          ws.onclose = () => {
            console.log(`[v0] ${symbol} kline WebSocket closed`)
          }

          klineConnections.push(ws)
        } catch (error) {
          console.error(`[v0] Error creating ${symbol} kline WebSocket:`, error)
        }
      })

      // Cleanup function
      const cleanup = () => {
        if (tickerWs) {
          tickerWs.close()
        }
        klineConnections.forEach((ws) => ws.close())
      }

      // Handle client disconnect
      request.signal.addEventListener("abort", cleanup)

      // Keep connection alive
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "heartbeat",
                timestamp: Date.now(),
              })}\\n\\n`,
            ),
          )
        } catch (error) {
          clearInterval(keepAlive)
          cleanup()
        }
      }, 30000)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  })
}
