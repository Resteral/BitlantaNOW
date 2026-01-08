"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Send, Receipt as Receive, History, Coins } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Transaction {
  id: string
  type: "send" | "receive" | "subscription" | "purchase"
  amount: number
  currency: string
  created_at: string
  description: string
  status: string
}

interface Profile {
  id: string
  wallet_balance: number
  display_name: string
}

export function CryptoWallet() {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadWalletData()
  }, [])

  const loadWalletData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profileData) {
        setProfile(profileData)
        setBalance(Number.parseFloat(profileData.wallet_balance) || 0)
      }

      const { data: transactionData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (transactionData) {
        setTransactions(transactionData)
      }
    } catch (error) {
      console.error("Error loading wallet data:", error)
    } finally {
      setLoading(false)
    }
  }

  const processSubscriptionPurchase = async (planId: string, price: number, planName: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return false

      // Check if user has sufficient balance
      if (balance < price) {
        alert("Insufficient RETRO balance!")
        return false
      }

      // Create subscription record
      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan_id: planId,
          plan_name: planName,
          price: price,
          currency: "RETRO",
          status: "active",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        })
        .select()
        .single()

      if (subError) throw subError

      // Create transaction record
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "subscription",
        amount: -price,
        currency: "RETRO",
        description: `${planName} Subscription`,
        subscription_id: subscription.id,
        status: "completed",
      })

      if (txError) throw txError

      // Update wallet balance
      const newBalance = balance - price
      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", user.id)

      if (balanceError) throw balanceError

      // Reload wallet data
      await loadWalletData()
      return true
    } catch (error) {
      console.error("Error processing subscription purchase:", error)
      return false
    }
  }

  // Make this function available globally for subscription component
  useEffect(() => {
    ;(window as any).processSubscriptionPurchase = processSubscriptionPurchase
  }, [balance])

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardContent className="p-6">
          <div className="animate-pulse text-center">Loading wallet...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 font-mono">
          <Wallet className="w-5 h-5 text-primary" />
          <span>CRYPTO WALLET</span>
        </CardTitle>
        <CardDescription>{profile?.display_name}'s retro crypto balance and transactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="text-center p-6 bg-primary/10 rounded-lg border border-primary/20">
          <div className="text-3xl font-bold text-primary font-mono retro-glow">{balance.toFixed(2)} RETRO</div>
          <p className="text-sm text-muted-foreground mt-1">≈ ${(balance * 2.5).toFixed(2)} USD</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" size="sm" className="font-mono bg-transparent">
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
          <Button variant="outline" size="sm" className="font-mono bg-transparent">
            <Receive className="w-4 h-4 mr-2" />
            Receive
          </Button>
          <Button variant="outline" size="sm" className="font-mono bg-transparent">
            <Coins className="w-4 h-4 mr-2" />
            Swap
          </Button>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <History className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium font-mono">RECENT TRANSACTIONS</span>
          </div>
          <div className="space-y-2">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded border">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        tx.type === "receive"
                          ? "bg-green-500"
                          : tx.type === "send"
                            ? "bg-red-500"
                            : tx.type === "subscription"
                              ? "bg-blue-500"
                              : "bg-purple-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium font-mono">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold font-mono ${tx.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount} {tx.currency}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">No transactions yet</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
