"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Lock, Unlock, Zap, Shield } from "lucide-react"

interface GateModalProps {
  isOpen: boolean
  onClose: () => void
  onUnlock: () => void
}

export function GateModal({ isOpen, onClose, onUnlock }: GateModalProps) {
  const [step, setStep] = useState(1)
  const [accessCode, setAccessCode] = useState("")
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleAccessSubmit = () => {
    if (
      accessCode.toLowerCase() === "atlantis" ||
      accessCode.toLowerCase() === "bitlanta" ||
      accessCode.toLowerCase() === "1337"
    ) {
      setStep(2)
      setIsUnlocking(true)

      let currentProgress = 0
      const interval = setInterval(() => {
        currentProgress += 8
        setProgress(currentProgress)

        if (currentProgress >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            onUnlock()
            setStep(1)
            setAccessCode("")
            setIsUnlocking(false)
            setProgress(0)
          }, 1000)
        }
      }, 150)
    }
  }

  const handleClose = () => {
    if (!isUnlocking) {
      onClose()
      setStep(1)
      setAccessCode("")
      setProgress(0)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 font-mono text-primary">
            {step === 1 ? (
              <>
                <Lock className="w-5 h-5 atlantis-glow" />
                <span>BITLANTA GATE ACCESS</span>
              </>
            ) : (
              <>
                <Unlock className="w-5 h-5 atlantis-glow" />
                <span>AWAKENING ANCIENT GATES...</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Enter the sacred code to unlock the gates of Bitlanta"
              : "The ancient gates are responding to your presence..."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="access-code" className="font-mono">
                Sacred Access Code
              </Label>
              <Input
                id="access-code"
                type="password"
                placeholder="Enter the ancient words..."
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="font-mono"
                onKeyDown={(e) => e.key === "Enter" && handleAccessSubmit()}
              />
              <p className="text-xs text-muted-foreground">Hint: The name of the lost city or elite numbers...</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center space-x-1 text-primary">
                <Shield className="w-3 h-3 atlantis-glow" />
                <span>Ancient</span>
              </div>
              <div className="flex items-center space-x-1 text-secondary">
                <Zap className="w-3 h-3 atlantis-glow" />
                <span>Mystical</span>
              </div>
              <div className="flex items-center space-x-1 text-accent">
                <Lock className="w-3 h-3 atlantis-glow" />
                <span>Sacred</span>
              </div>
            </div>

            <Button onClick={handleAccessSubmit} className="w-full font-mono atlantis-glow" disabled={!accessCode}>
              AWAKEN THE GATES
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 atlantis-glow">
                <Unlock className="w-8 h-8 text-primary electric-current" />
              </div>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm font-mono text-muted-foreground">{progress}% Complete</p>
            </div>

            <div className="text-xs space-y-1 font-mono text-center">
              <p>• Awakening ancient guardians...</p>
              <p>• Channeling ethereal energy...</p>
              <p>• Opening gates to Bitlanta...</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
