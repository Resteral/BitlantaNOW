"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Plus, Copy, Trash2, Key, Shield, TrendingUp, AlertTriangle, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InviteCode {
  id: string
  code: string
  createdAt: Date
  usedBy?: string
  isUsed: boolean
}

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

interface AdminPanelProps {
  isAdmin: boolean
  onToggleAdmin: () => void
  onSignalUpdate?: (signals: MarketSignal[]) => void
}

export function AdminPanel({ isAdmin, onToggleAdmin, onSignalUpdate }: AdminPanelProps) {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([
    {
      id: "1",
      code: "atlantis",
      createdAt: new Date(),
      isUsed: false,
    },
    {
      id: "2",
      code: "bitlanta",
      createdAt: new Date(),
      isUsed: false,
    },
    {
      id: "3",
      code: "1337",
      createdAt: new Date(),
      isUsed: false,
    },
  ])
  const [newCodePrefix, setNewCodePrefix] = useState("")
  const { toast } = useToast()

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

  const [newSignal, setNewSignal] = useState({
    symbol: "",
    type: "crypto" as "crypto" | "stock",
    status: "green" as "green" | "red",
    title: "",
    description: "",
    price: "",
  })

  const [activeTab, setActiveTab] = useState<"codes" | "signals">("codes")

  const generateInviteCode = () => {
    const prefix = newCodePrefix || "ATL"
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
    const newCode = `${prefix}-${randomSuffix}`

    const inviteCode: InviteCode = {
      id: Date.now().toString(),
      code: newCode,
      createdAt: new Date(),
      isUsed: false,
    }

    setInviteCodes((prev) => [...prev, inviteCode])
    setNewCodePrefix("")

    toast({
      title: "Invite Code Created",
      description: `New code: ${newCode}`,
    })
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Code Copied",
      description: `${code} copied to clipboard`,
    })
  }

  const deleteCode = (id: string) => {
    setInviteCodes((prev) => prev.filter((code) => code.id !== id))
    toast({
      title: "Code Deleted",
      description: "Invite code has been removed",
    })
  }

  const createMarketSignal = () => {
    if (!newSignal.symbol || !newSignal.title) {
      toast({
        title: "Missing Information",
        description: "Symbol and title are required",
        variant: "destructive",
      })
      return
    }

    const signal: MarketSignal = {
      id: Date.now().toString(),
      symbol: newSignal.symbol.toUpperCase(),
      type: newSignal.type,
      status: newSignal.status,
      title: newSignal.title,
      description: newSignal.description,
      price: newSignal.price,
      createdAt: new Date(),
    }

    const updatedSignals = [...marketSignals, signal]
    setMarketSignals(updatedSignals)
    onSignalUpdate?.(updatedSignals)

    setNewSignal({
      symbol: "",
      type: "crypto",
      status: "green",
      title: "",
      description: "",
      price: "",
    })

    toast({
      title: "Signal Created",
      description: `${signal.status === "green" ? "Green Light" : "Red Alert"} for ${signal.symbol}`,
    })
  }

  const deleteSignal = (id: string) => {
    const updatedSignals = marketSignals.filter((signal) => signal.id !== id)
    setMarketSignals(updatedSignals)
    onSignalUpdate?.(updatedSignals)

    toast({
      title: "Signal Deleted",
      description: "Market signal has been removed",
    })
  }

  if (!isAdmin) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20 underwater-float">
        <CardContent className="p-6 text-center">
          <Shield className="w-8 h-8 text-primary mx-auto mb-3 atlantis-glow" />
          <h3 className="font-mono text-sm font-bold mb-2 hologram-effect">ADMIN ACCESS</h3>
          <p className="text-xs text-muted-foreground mb-4">Restricted to Atlantean Council Members</p>
          <Button size="sm" variant="outline" onClick={onToggleAdmin} className="font-mono text-xs bg-transparent">
            <Key className="w-3 h-3 mr-1" />
            AUTHENTICATE
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20 underwater-float">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between font-mono hologram-effect text-sm">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-primary atlantis-glow" />
            <span>ADMIN CONSOLE</span>
          </div>
          <Button size="sm" variant="ghost" onClick={onToggleAdmin} className="text-xs">
            EXIT
          </Button>
        </CardTitle>

        <div className="flex space-x-1 mt-2">
          <Button
            size="sm"
            variant={activeTab === "codes" ? "default" : "ghost"}
            onClick={() => setActiveTab("codes")}
            className="text-xs font-mono"
          >
            <Key className="w-3 h-3 mr-1" />
            CODES
          </Button>
          <Button
            size="sm"
            variant={activeTab === "signals" ? "default" : "ghost"}
            onClick={() => setActiveTab("signals")}
            className="text-xs font-mono"
          >
            <DollarSign className="w-3 h-3 mr-1" />
            SIGNALS
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {activeTab === "codes" && (
          <>
            {/* Create New Code */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground">CREATE INVITE CODE</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Prefix (optional)"
                  value={newCodePrefix}
                  onChange={(e) => setNewCodePrefix(e.target.value.toUpperCase())}
                  className="text-xs font-mono"
                  maxLength={6}
                />
                <Button size="sm" onClick={generateInviteCode} className="font-mono text-xs atlantis-glow">
                  <Plus className="w-3 h-3 mr-1" />
                  CREATE
                </Button>
              </div>
            </div>

            {/* Invite Codes List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-muted-foreground">ACTIVE CODES</label>
                <Badge variant="secondary" className="text-xs font-mono">
                  {inviteCodes.filter((c) => !c.isUsed).length} ACTIVE
                </Badge>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {inviteCodes.map((code) => (
                  <div
                    key={code.id}
                    className="flex items-center justify-between p-2 bg-background/50 rounded border border-border/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <code className="text-xs font-mono text-primary atlantis-glow">{code.code}</code>
                        {code.isUsed && (
                          <Badge variant="outline" className="text-xs">
                            USED
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{code.createdAt.toLocaleDateString()}</div>
                    </div>

                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(code.code)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteCode(code.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-primary/10 rounded">
                <div className="font-mono text-primary atlantis-glow font-bold">{inviteCodes.length}</div>
                <div className="text-muted-foreground">Total Codes</div>
              </div>
              <div className="text-center p-2 bg-secondary/10 rounded">
                <div className="font-mono text-secondary atlantis-glow font-bold">
                  {inviteCodes.filter((c) => c.isUsed).length}
                </div>
                <div className="text-muted-foreground">Used Codes</div>
              </div>
            </div>
          </>
        )}

        {activeTab === "signals" && (
          <>
            {/* Create New Signal */}
            <div className="space-y-3">
              <label className="text-xs font-mono text-muted-foreground">CREATE MARKET SIGNAL</label>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Symbol (BTC, AAPL)"
                  value={newSignal.symbol}
                  onChange={(e) => setNewSignal({ ...newSignal, symbol: e.target.value.toUpperCase() })}
                  className="text-xs font-mono"
                />
                <Input
                  placeholder="Price (optional)"
                  value={newSignal.price}
                  onChange={(e) => setNewSignal({ ...newSignal, price: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={newSignal.type}
                  onValueChange={(value: "crypto" | "stock") => setNewSignal({ ...newSignal, type: value })}
                >
                  <SelectTrigger className="text-xs font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crypto">CRYPTO</SelectItem>
                    <SelectItem value="stock">STOCK</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={newSignal.status}
                  onValueChange={(value: "green" | "red") => setNewSignal({ ...newSignal, status: value })}
                >
                  <SelectTrigger className="text-xs font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="green">🟢 GREEN LIGHT</SelectItem>
                    <SelectItem value="red">🔴 RED ALERT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Signal Title"
                value={newSignal.title}
                onChange={(e) => setNewSignal({ ...newSignal, title: e.target.value })}
                className="text-xs font-mono"
              />

              <Textarea
                placeholder="Signal Description"
                value={newSignal.description}
                onChange={(e) => setNewSignal({ ...newSignal, description: e.target.value })}
                className="text-xs font-mono resize-none"
                rows={2}
              />

              <Button onClick={createMarketSignal} className="w-full font-mono text-xs atlantis-glow">
                <Plus className="w-3 h-3 mr-1" />
                CREATE SIGNAL
              </Button>
            </div>

            {/* Market Signals List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-muted-foreground">ACTIVE SIGNALS</label>
                <div className="flex space-x-1">
                  <Badge variant="secondary" className="text-xs font-mono bg-green-500/20 text-green-400">
                    {marketSignals.filter((s) => s.status === "green").length} GREEN
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-mono bg-red-500/20 text-red-400">
                    {marketSignals.filter((s) => s.status === "red").length} RED
                  </Badge>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {marketSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className={`p-3 rounded border ${
                      signal.status === "green"
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-red-500/10 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {signal.status === "green" ? (
                            <TrendingUp className="w-3 h-3 text-green-400" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                          )}
                          <code className="text-xs font-mono font-bold">{signal.symbol}</code>
                          <Badge variant="outline" className="text-xs">
                            {signal.type.toUpperCase()}
                          </Badge>
                          {signal.price && (
                            <span className="text-xs font-mono text-muted-foreground">{signal.price}</span>
                          )}
                        </div>
                        <div className="text-xs font-semibold mb-1">{signal.title}</div>
                        <div className="text-xs text-muted-foreground">{signal.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {signal.createdAt.toLocaleDateString()} {signal.createdAt.toLocaleTimeString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSignal(signal.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
