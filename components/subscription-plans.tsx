"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Crown, Rocket, Star } from "lucide-react"

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  duration: string
  features: string[]
  icon: React.ReactNode
  popular?: boolean
  color: string
}

interface SubscriptionPlansProps {
  onPurchase?: (planId: string, price: number) => void
}

export function SubscriptionPlans({ onPurchase }: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const plans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "BASIC GATE",
      price: 49.99,
      currency: "RETRO",
      duration: "monthly",
      features: ["Access to 3 premium gates", "Basic crypto analytics", "Standard trading tools", "Community access"],
      icon: <Zap className="w-6 h-6" />,
      color: "text-secondary",
    },
    {
      id: "premium",
      name: "PREMIUM GATE",
      price: 99.99,
      currency: "RETRO",
      duration: "monthly",
      features: [
        "Access to all 7 gates",
        "Advanced AI analytics",
        "Pro trading algorithms",
        "Priority support",
        "Exclusive NFT drops",
        "VIP community access",
      ],
      icon: <Crown className="w-6 h-6" />,
      color: "text-primary",
      popular: true,
    },
    {
      id: "elite",
      name: "ELITE GATE",
      price: 199.99,
      currency: "RETRO",
      duration: "monthly",
      features: [
        "Unlimited gate access",
        "Custom AI trading bots",
        "Real-time market signals",
        "1-on-1 crypto mentoring",
        "Early access to new features",
        "Exclusive alpha group",
        "Custom NFT creation tools",
      ],
      icon: <Rocket className="w-6 h-6" />,
      color: "text-accent",
    },
  ]

  const handlePurchase = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan.id)
    setProcessing(true)

    try {
      const connectedWallet = (window as any).connectedWallet
      const initiateWalletTransaction = (window as any).initiateWalletTransaction

      if (connectedWallet && initiateWalletTransaction) {
        // Use connected wallet for payment
        const ethAmount = plan.price * 0.001 // Convert RETRO to ETH (example rate)

        if (Number.parseFloat(connectedWallet.balance) < ethAmount) {
          alert(`Insufficient wallet balance! Need ${ethAmount.toFixed(4)} ETH`)
          return
        }

        const txHash = await initiateWalletTransaction(ethAmount)

        if (txHash) {
          // Record successful wallet transaction
          alert(`Successfully purchased ${plan.name} with wallet! Transaction: ${txHash.slice(0, 10)}...`)
        } else {
          alert("Wallet transaction failed. Please try again.")
        }
      } else {
        // Fallback to internal RETRO balance
        const processSubscriptionPurchase = (window as any).processSubscriptionPurchase

        if (processSubscriptionPurchase) {
          const success = await processSubscriptionPurchase(plan.id, plan.price, plan.name)

          if (success) {
            alert(`Successfully purchased ${plan.name} with RETRO tokens!`)
          } else {
            alert("Purchase failed. Please check your RETRO balance and try again.")
          }
        } else {
          // Final fallback to original onPurchase prop
          if (onPurchase) {
            onPurchase(plan.id, plan.price)
          }
        }
      }
    } catch (error) {
      console.error("Purchase error:", error)
      alert("Purchase failed. Please try again.")
    } finally {
      setProcessing(false)
      setSelectedPlan(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold font-mono mb-2">SUBSCRIPTION GATES</h3>
        <p className="text-muted-foreground">Choose your level of crypto enlightenment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative bg-card/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
              plan.popular ? "border-primary/50 ring-2 ring-primary/20" : "border-border/20"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground font-mono retro-glow">
                  <Star className="w-3 h-3 mr-1" />
                  MOST POPULAR
                </Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <div className={`mx-auto mb-2 ${plan.color}`}>{plan.icon}</div>
              <CardTitle className="font-mono">{plan.name}</CardTitle>
              <CardDescription>
                <span className={`text-3xl font-bold ${plan.color} font-mono`}>{plan.price}</span>
                <span className="text-sm text-muted-foreground ml-1">
                  {plan.currency}/{plan.duration}
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full font-mono retro-glow"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handlePurchase(plan)}
                disabled={selectedPlan === plan.id || processing}
              >
                {selectedPlan === plan.id ? "PROCESSING..." : "PURCHASE GATE"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
