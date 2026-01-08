"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, ExternalLink, Copy, CheckCircle, AlertCircle, Zap } from "lucide-react"
import { toast } from "sonner"

interface WalletInfo {
  name: string
  icon: string
  installed: boolean
  connecting: boolean
  connected: boolean
  address?: string
  balance?: string
}

interface ConnectedWallet {
  name: string
  address: string
  balance: string
  chainId: number
  network: string
}

export function WalletConnector() {
  const [wallets, setWallets] = useState<WalletInfo[]>([
    { name: "MetaMask", icon: "🦊", installed: false, connecting: false, connected: false },
    { name: "Coinbase Wallet", icon: "🔵", installed: false, connecting: false, connected: false },
    { name: "TrustWallet", icon: "🛡️", installed: false, connecting: false, connected: false },
    { name: "WalletConnect", icon: "🔗", installed: true, connecting: false, connected: false },
  ])

  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    checkWalletSupport()
  }, [])

  const checkWalletSupport = () => {
    if (typeof window === "undefined") return

    setIsSupported(true)

    setWallets((prev) =>
      prev.map((wallet) => {
        switch (wallet.name) {
          case "MetaMask":
            return { ...wallet, installed: !!(window as any).ethereum?.isMetaMask }
          case "Coinbase Wallet":
            return { ...wallet, installed: !!(window as any).ethereum?.isCoinbaseWallet }
          case "TrustWallet":
            return { ...wallet, installed: !!(window as any).ethereum?.isTrust }
          default:
            return wallet
        }
      }),
    )
  }

  const connectWallet = async (walletName: string) => {
    if (!isSupported) {
      toast.error("Web3 not supported in this browser")
      return
    }

    setWallets((prev) => prev.map((w) => (w.name === walletName ? { ...w, connecting: true } : w)))

    try {
      let provider: any = null

      switch (walletName) {
        case "MetaMask":
          if ((window as any).ethereum?.isMetaMask) {
            provider = (window as any).ethereum
          }
          break
        case "Coinbase Wallet":
          if ((window as any).ethereum?.isCoinbaseWallet) {
            provider = (window as any).ethereum
          }
          break
        case "TrustWallet":
          if ((window as any).ethereum?.isTrust) {
            provider = (window as any).ethereum
          }
          break
        case "WalletConnect":
          // For demo purposes, simulate WalletConnect
          await new Promise((resolve) => setTimeout(resolve, 2000))
          const mockAddress = "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
          const mockBalance = "2.45"

          setConnectedWallet({
            name: walletName,
            address: mockAddress,
            balance: mockBalance,
            chainId: 1,
            network: "Ethereum Mainnet",
          })

          setWallets((prev) =>
            prev.map((w) =>
              w.name === walletName
                ? { ...w, connecting: false, connected: true, address: mockAddress, balance: mockBalance }
                : { ...w, connected: false },
            ),
          )

          toast.success(`Connected to ${walletName}!`)
          return
      }

      if (!provider) {
        if (walletName === "MetaMask") {
          window.open("https://metamask.io/download/", "_blank")
        } else if (walletName === "Coinbase Wallet") {
          window.open("https://www.coinbase.com/wallet", "_blank")
        } else if (walletName === "TrustWallet") {
          window.open("https://trustwallet.com/", "_blank")
        }
        toast.error(`${walletName} not installed. Redirecting to download...`)
        return
      }

      const accounts = await provider.request({ method: "eth_requestAccounts" })
      const chainId = await provider.request({ method: "eth_chainId" })

      if (accounts.length > 0) {
        const address = accounts[0]
        const balance = await provider.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        })

        // Convert balance from wei to ETH (simplified)
        const ethBalance = (Number.parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)

        const networkName =
          chainId === "0x1"
            ? "Ethereum Mainnet"
            : chainId === "0x89"
              ? "Polygon"
              : chainId === "0x38"
                ? "BSC"
                : "Unknown Network"

        setConnectedWallet({
          name: walletName,
          address,
          balance: ethBalance,
          chainId: Number.parseInt(chainId, 16),
          network: networkName,
        })

        setWallets((prev) =>
          prev.map((w) =>
            w.name === walletName
              ? { ...w, connecting: false, connected: true, address, balance: ethBalance }
              : { ...w, connected: false },
          ),
        )

        toast.success(`Connected to ${walletName}!`)
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error)
      toast.error(error.message || "Failed to connect wallet")
    } finally {
      setWallets((prev) => prev.map((w) => (w.name === walletName ? { ...w, connecting: false } : w)))
    }
  }

  const disconnectWallet = () => {
    setConnectedWallet(null)
    setWallets((prev) => prev.map((w) => ({ ...w, connected: false, address: undefined, balance: undefined })))
    toast.success("Wallet disconnected")
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success("Address copied to clipboard!")
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const initiateWalletTransaction = async (amount: number, recipient?: string) => {
    if (!connectedWallet) {
      toast.error("No wallet connected")
      return false
    }

    try {
      const provider = (window as any).ethereum
      if (!provider) {
        toast.error("Wallet provider not found")
        return false
      }

      // Convert amount to wei (assuming ETH payment)
      const amountInWei = (amount * Math.pow(10, 18)).toString(16)

      const transactionParameters = {
        to: recipient || "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87", // Default treasury address
        from: connectedWallet.address,
        value: `0x${amountInWei}`,
        gas: "0x5208", // 21000 gas limit
      }

      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      })

      toast.success(`Transaction sent! Hash: ${txHash.slice(0, 10)}...`)
      return txHash
    } catch (error: any) {
      console.error("Transaction error:", error)
      toast.error(error.message || "Transaction failed")
      return false
    }
  }

  useEffect(() => {
    if (connectedWallet) {
      ;(window as any).initiateWalletTransaction = initiateWalletTransaction
      ;(window as any).connectedWallet = connectedWallet
    } else {
      ;(window as any).initiateWalletTransaction = null
      ;(window as any).connectedWallet = null
    }
  }, [connectedWallet])

  if (!isSupported) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Web3 Not Supported</h3>
          <p className="text-muted-foreground">Please use a Web3-enabled browser to connect your wallet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 font-mono">
          <Wallet className="w-5 h-5 text-primary" />
          <span>WALLET CONNECTOR</span>
        </CardTitle>
        <CardDescription>Connect your crypto wallet to access advanced Atlantean features</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {connectedWallet ? (
          <div className="space-y-4">
            {/* Connected Wallet Display */}
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-mono text-sm font-bold text-green-500">CONNECTED</span>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {connectedWallet.network}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Wallet:</span>
                  <span className="font-mono text-sm font-bold">{connectedWallet.name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Address:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">{formatAddress(connectedWallet.address)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyAddress(connectedWallet.address)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Balance:</span>
                  <span className="font-mono text-sm font-bold text-primary">{connectedWallet.balance} ETH</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" className="font-mono bg-transparent">
                <Zap className="w-4 h-4 mr-2" />
                Bridge Assets
              </Button>
              <Button variant="destructive" size="sm" onClick={disconnectWallet} className="font-mono">
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Choose your preferred wallet to connect to Bitlanta
            </p>

            {/* Wallet Options */}
            <div className="grid grid-cols-1 gap-3">
              {wallets.map((wallet) => (
                <Button
                  key={wallet.name}
                  variant="outline"
                  size="lg"
                  onClick={() => connectWallet(wallet.name)}
                  disabled={wallet.connecting}
                  className="justify-between p-4 h-auto font-mono bg-transparent hover:bg-primary/10"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div className="text-left">
                      <div className="font-bold">{wallet.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {wallet.name === "WalletConnect"
                          ? "Scan QR Code"
                          : wallet.installed
                            ? "Detected"
                            : "Not Installed"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {wallet.connecting && (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                    {!wallet.installed && wallet.name !== "WalletConnect" && (
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </Button>
              ))}
            </div>

            {/* Info Section */}
            <div className="mt-6 p-3 bg-muted/50 rounded border text-center">
              <p className="text-xs text-muted-foreground">
                🔒 Your wallet connection is secure and encrypted. Bitlanta never stores your private keys.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
