"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  planName: string
  amount: number
  onSuccess: () => void
}

export function TransactionModal({ isOpen, onClose, planName, amount, onSuccess }: TransactionModalProps) {
  const [step, setStep] = useState<"processing" | "success" | "error">("processing")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setStep("processing")
      setProgress(0)

      const connectedWallet = (window as any).connectedWallet
      const isWalletTransaction = connectedWallet !== null

      // Simulate transaction processing
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            const successRate = isWalletTransaction ? 0.95 : 0.9 // 95% vs 90%
            const success = Math.random() > 1 - successRate
            setStep(success ? "success" : "error")
            if (success) {
              setTimeout(() => {
                onSuccess()
                onClose()
              }, 2000)
            }
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 200)

      return () => clearInterval(interval)
    }
  }, [isOpen, onSuccess, onClose])

  const handleRetry = () => {
    setStep("processing")
    setProgress(0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-mono text-center">TRANSACTION IN PROGRESS</DialogTitle>
          <DialogDescription className="text-center">
            Processing your {planName} subscription purchase
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Transaction Details */}
          <div className="bg-muted/50 p-4 rounded border space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subscription:</span>
              <span className="font-mono font-bold">{planName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Amount:</span>
              <span className="font-mono font-bold text-primary">
                {(window as any).connectedWallet ? `${(amount * 0.001).toFixed(4)} ETH` : `${amount} RETRO`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Network Fee:</span>
              <span className="font-mono">{(window as any).connectedWallet ? "~0.002 ETH" : "0.1 RETRO"}</span>
            </div>
            <hr className="border-border/50" />
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span className="font-mono text-primary">
                {(window as any).connectedWallet
                  ? `${(amount * 0.001 + 0.002).toFixed(4)} ETH`
                  : `${(amount + 0.1).toFixed(1)} RETRO`}
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Payment Method:</span>
              <span className="font-mono">
                {(window as any).connectedWallet ? "Connected Wallet" : "RETRO Balance"}
              </span>
            </div>
          </div>

          {/* Status Display */}
          <div className="text-center space-y-4">
            {step === "processing" && (
              <>
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                <div className="space-y-2">
                  <p className="text-sm font-mono">PROCESSING TRANSACTION...</p>
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-muted-foreground">Confirming on the blockchain...</p>
                </div>
              </>
            )}

            {step === "success" && (
              <>
                <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                <div className="space-y-2">
                  <p className="text-sm font-mono text-green-500">TRANSACTION SUCCESSFUL!</p>
                  <p className="text-xs text-muted-foreground">Your subscription is now active. Redirecting...</p>
                </div>
              </>
            )}

            {step === "error" && (
              <>
                <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
                <div className="space-y-2">
                  <p className="text-sm font-mono text-red-500">TRANSACTION FAILED</p>
                  <p className="text-xs text-muted-foreground">Insufficient balance or network error</p>
                </div>
                <Button onClick={handleRetry} variant="outline" className="font-mono bg-transparent">
                  RETRY TRANSACTION
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
