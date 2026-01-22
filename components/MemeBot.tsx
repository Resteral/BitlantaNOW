"use client";

import React, { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import { Activity, TrendingUp, Wallet, Play, Square, DollarSign } from "lucide-react";

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

    useEffect(() => {
        // Determine backend URL
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
        console.log("Connecting to Bot Engine at:", BACKEND_URL);

        const newSocket = io(BACKEND_URL);
        setSocket(newSocket);

        newSocket.on("connect", () => {
            addLog(`Connected to Bot Engine at ${BACKEND_URL}`);
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
            addLog(`Error fetching status from ${BACKEND_URL}`);
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
        <div className="space-y-6">
            {/* Wallet Status */}
            <div className="flex items-center justify-between p-6 bg-card border rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/10 rounded-full">
                        <Wallet className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Bot Wallet</h3>
                        <div className="font-mono text-xs text-muted-foreground">{wallet.publicKey}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold font-mono">{wallet.balance.toFixed(4)} SOL</div>
                    <div className="text-xs text-green-500">Active</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Market Monitor */}
                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <h3 className="font-semibold">Live Market</h3>
                    </div>
                    <div className="divide-y max-h-[400px] overflow-auto">
                        {prices.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground italic">
                                Scanning Solana Membrane...
                            </div>
                        ) : prices.map((token) => (
                            <div key={token.symbol} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                <span className="font-bold">{token.symbol}</span>
                                <div className="text-right">
                                    <div className="font-mono font-medium">${token.priceUsd.toFixed(6)}</div>
                                    <div className={`text-xs ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trade Controls */}
                <div className="bg-card border rounded-xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold">Trade Terminal</h3>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase text-muted-foreground">Target Token (Address)</label>
                        <input
                            type="text"
                            className="w-full p-2 bg-background border rounded font-mono text-sm focus:ring-2 ring-primary outline-none"
                            placeholder="Ep9... or similar"
                            value={targetToken}
                            onChange={(e) => setTargetToken(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase text-muted-foreground">Amount (SOL)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                            <input
                                type="number"
                                className="w-full p-2 pl-8 bg-background border rounded font-mono text-sm focus:ring-2 ring-primary outline-none"
                                value={tradeAmount}
                                onChange={(e) => setTradeAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            onClick={handleTrade}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded flex items-center justify-center gap-2 transition-transform active:scale-95"
                        >
                            <Play className="w-4 h-4" /> BUY
                        </button>
                        <button
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded flex items-center justify-center gap-2 transition-transform active:scale-95"
                        >
                            <Square className="w-4 h-4" /> SELL
                        </button>
                    </div>
                </div>
            </div>

            {/* Logs */}
            <div className="bg-black/90 p-4 rounded-xl border font-mono text-xs h-48 overflow-y-auto">
                <div className="text-muted-foreground mb-2 border-b border-white/10 pb-1">SYSTEM LOGS</div>
                {logs.map((log, i) => (
                    <div key={i} className="mb-1 text-green-400/80">
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
}
