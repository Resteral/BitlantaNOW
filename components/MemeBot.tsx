"use client";

import React, { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import { Activity, TrendingUp, Wallet, Play, Square, DollarSign, Lock, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TokenPrice {
    symbol: string;
    priceUsd: number;
    change24h: number;
}

interface WalletState {
    balance: number;
    publicKey: string;
}

export function MemeBot() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [prices, setPrices] = useState<TokenPrice[]>([]);
    const [wallet, setWallet] = useState<WalletState>({ balance: 0, publicKey: "Loading..." });
    const [tradeAmount, setTradeAmount] = useState<string>("0.01");
    const [targetToken, setTargetToken] = useState<string>("");
    const [logs, setLogs] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Determine backend URL
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
        console.log("Connecting to Bot Engine at:", BACKEND_URL);

        const newSocket = io(BACKEND_URL);
        setSocket(newSocket);

        newSocket.on("connect", () => {
            setIsConnected(true);
            addLog(`Connected to Bot Engine at ${BACKEND_URL}`);
        });

        newSocket.on("disconnect", () => {
            setIsConnected(false);
            addLog("Disconnected from Bot Engine");
        });

        newSocket.on("priceUpdate", (data: TokenPrice[]) => {
            setPrices(data);
        });

        fetchStatus();

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const addLog = (msg: string) => {
        setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));
    };

    const fetchStatus = async () => {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
        try {
            const res = await axios.get(`${BACKEND_URL}/api/status`);
            setWallet({
                balance: res.data.balance,
                publicKey: res.data.publicKey
            });
            addLog(`Wallet loaded: ${res.data.publicKey.slice(0, 6)}...`);
        } catch (e) {
            addLog("Status fetch failed - Engine offline?");
        }
    };

    const handleTrade = async () => {
        if (!targetToken) {
            addLog("Error: Enter a token address");
            return;
        }

        addLog(`Initiating trade for ${tradeAmount} SOL...`);
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
        try {
            const res = await axios.post(`${BACKEND_URL}/api/trade`, {
                inputMint: "So11111111111111111111111111111111111111112", // SOL
                outputMint: targetToken,
                amount: parseFloat(tradeAmount) * 1_000_000_000 // Convert to Lamports
            });

            if (res.data.success) {
                addLog(`Trade Success! Tx: ${res.data.txid.slice(0, 8)}...`);
            }
        } catch (e) {
            addLog("Trade Failed. Check backend logs.");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
            {/* Wallet Status */}
            <Card className="lg:col-span-3 bg-card/80 backdrop-blur-sm border-primary/30 underwater-float">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium font-mono hologram-effect flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-primary atlantis-glow" />
                        BOT WALLET BUFFER
                    </CardTitle>
                    <Badge variant="outline" className={`font-mono ${isConnected ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>
                        {isConnected ? 'ONLINE' : 'OFFLINE'}
                    </Badge>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-2xl font-bold font-mono text-primary atlantis-glow">
                            {wallet.balance.toFixed(4)} SOL
                        </div>
                        <div className="font-mono text-xs text-muted-foreground bg-black/40 px-3 py-1 rounded-full border border-primary/20">
                            {wallet.publicKey}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Market Monitor */}
            <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-secondary/30 underwater-float" style={{ animationDelay: "0.2s" }}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium font-mono hologram-effect flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-secondary atlantis-glow" />
                        MEMBRANE SCANNER
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="divide-y divide-secondary/20 max-h-[350px] overflow-auto pr-2 custom-scrollbar">
                        {prices.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground italic font-mono flex flex-col items-center gap-4">
                                <Activity className="w-8 h-8 animate-pulse text-secondary" />
                                <span>Scanning the deep...</span>
                            </div>
                        ) : prices.map((token) => (
                            <div key={token.symbol} className="py-3 flex items-center justify-between hover:bg-secondary/10 transition-colors px-2 rounded">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-3 h-3 text-secondary/70" />
                                    <span className="font-bold font-mono">{token.symbol}</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-medium">${token.priceUsd.toFixed(6)}</div>
                                    <div className={`text-xs font-mono px-2 py-0.5 rounded ${token.change24h >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Trade Controls */}
            <div className="space-y-6 lg:col-span-1">
                <Card className="bg-card/80 backdrop-blur-sm border-accent/30 underwater-float" style={{ animationDelay: "0.4s" }}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium font-mono hologram-effect flex items-center gap-2">
                            <Zap className="w-4 h-4 text-accent atlantis-glow" />
                            EXECUTION TERMINAL
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-muted-foreground uppercase">Target Asset</label>
                            <Input
                                type="text"
                                className="bg-black/40 border-accent/20 font-mono text-sm focus:border-accent"
                                placeholder="Token Address..."
                                value={targetToken}
                                onChange={(e) => setTargetToken(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono text-muted-foreground uppercase">Volume (SOL)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    className="pl-8 bg-black/40 border-accent/20 font-mono text-sm focus:border-accent"
                                    value={tradeAmount}
                                    onChange={(e) => setTradeAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Button
                                onClick={handleTrade}
                                className="bg-green-600/20 hover:bg-green-600/40 text-green-500 border border-green-500/50 font-mono"
                            >
                                <Play className="w-3 h-3 mr-2" /> BUY
                            </Button>
                            <Button
                                className="bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-500/50 font-mono"
                            >
                                <Square className="w-3 h-3 mr-2" /> SELL
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Logs */}
                <div className="bg-black/80 p-3 rounded-lg border border-primary/20 font-mono text-[10px] h-[150px] overflow-y-auto custom-scrollbar shadow-inner shadow-black/50">
                    <div className="text-primary/70 mb-2 border-b border-primary/20 pb-1 flex justify-between">
                        <span>SYSTEM LOGS</span>
                        <span className="animate-pulse">●</span>
                    </div>
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1 text-primary/60 truncate">
                            {log}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
