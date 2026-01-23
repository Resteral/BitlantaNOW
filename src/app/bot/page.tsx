'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js';
import { SolanaProvider } from '@/components/SolanaProvider';
import { getTokenMetadata, getSolPrice, getMultiTokenPrices, getTrendingTokens, MobulaTokenData } from '@/lib/mobula';
import { getQuote, createSwapTransaction } from '@/lib/jupiter';
import { VersionedTransaction } from '@solana/web3.js';

// Removed problematic dynamic import

interface Trade {
    id: string;
    time: string;
    type: 'BUY' | 'SELL' | 'SNIPE';
    ca: string;
    asset: string;
    assetName: string;
    logo: string | null;
    amount: string;
    entryPrice: number;
    currentPrice: number;
    pnlPercent: number;
    pnlUsd: number;
    status: 'PROCESSING' | 'CONFIRMED' | 'FAILED';
    sig: string | null;
}


function BotInterface() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);
    const [solPrice, setSolPrice] = useState(245.82);
    const [amount, setAmount] = useState('0.1');
    const [status, setStatus] = useState<string | null>(null);

    // Sniper Specific State
    const [snipeMode, setSnipeMode] = useState(false);
    const [autoSnipe, setAutoSnipe] = useState(false);
    const [contractAddress, setContractAddress] = useState('');
    const [slippage, setSlippage] = useState('15');
    const [priorityFee, setPriorityFee] = useState('0.001');
    const [tokenInfo, setTokenInfo] = useState<MobulaTokenData | null>(null);

    // Auto Discovery
    const [autoDiscovery, setAutoDiscovery] = useState(false);

    // Automation: Auto-Sell (TP/SL)
    const [takeProfit, setTakeProfit] = useState('100'); // 100% (2x)
    const [stopLoss, setStopLoss] = useState('30'); // 30% drop
    const [autoSell, setAutoSell] = useState(false);

    // Trade History / Ledger
    const [trades, setTrades] = useState<Trade[]>([]);

    useEffect(() => {
        if (!publicKey) return;

        const getBalance = async () => {
            try {
                const info = await connection.getAccountInfo(publicKey);
                if (info) {
                    setBalance(info.lamports / LAMPORTS_PER_SOL);
                } else {
                    setBalance(0); // Account exists (on curve) but has no data/SOL, or new account
                }
            } catch (error) {
                console.error('Failed to fetch balance:', error);
                setBalance(0);
            }
            const price = await getSolPrice();
            setSolPrice(price);
        };

        getBalance();
        const id = connection.onAccountChange(publicKey, (account) => {
            setBalance(account.lamports / LAMPORTS_PER_SOL);
        });

        const interval = setInterval(getBalance, 30000); // 30s refresh

        return () => {
            connection.removeAccountChangeListener(id);
            clearInterval(interval);
        };
    }, [publicKey, connection]);

    // Real Token lookup & Auto-Snipe trigger
    useEffect(() => {
        if (contractAddress.length > 30) {
            const lookup = async () => {
                const data = await getTokenMetadata(contractAddress);
                if (data) {
                    setTokenInfo(data);
                    if (autoSnipe && snipeMode) {
                        // Autonomous Safety Check: Don't snipe if liquidity < $5k
                        if (data.liquidity < 5000) {
                            setStatus('SNIPE_ABORTED: Low Liquidity detected.');
                        } else {
                            handleTrade('SNIPE');
                        }
                    }
                } else {
                    setTokenInfo(null);
                }
            };
            lookup();
        } else {
            setTokenInfo(null);
        }
    }, [contractAddress, autoSnipe, snipeMode]);

    // Auto Discovery Logic
    useEffect(() => {
        if (!autoDiscovery || !snipeMode) return;

        const discover = async () => {
            setStatus('AUTO_DISCOVERY: Scanning for trending tokens...');
            try {
                const trending = await getTrendingTokens();
                if (trending && trending.length > 0) {
                    // Filter for targets with liquidity > $5,000 for safety
                    const viableTargets = trending.filter(t => t.liquidity > 5000);

                    // Sort by liquidity descending to pick the strongest token
                    viableTargets.sort((a, b) => b.liquidity - a.liquidity);

                    const target = viableTargets.length > 0 ? viableTargets[0] : null;

                    if (target && target.address && target.address !== contractAddress) {
                        setStatus(`AUTO_DISCOVERY: Found safe target ${target.symbol} ($${target.liquidity.toLocaleString()} Liq)! Switching...`);
                        setContractAddress(target.address);
                        // The primary effect will pick this up, fetch detailed metadata, and trigger autoSnipe if enabled
                    } else if (!target) {
                        setStatus('AUTO_DISCOVERY: No targets met liquidity requirements (min $5k).');
                    }
                }
            } catch (err) {
                console.error('Auto discovery error:', err);
            }
        };

        const interval = setInterval(discover, 10000); // Scan every 10s
        discover(); // Initial scan

        return () => clearInterval(interval);
    }, [autoDiscovery, snipeMode, contractAddress]);

    // Auto-PnL Monitoring
    useEffect(() => {
        const monitorPnL = async () => {
            const activeTrades = trades.filter(t => t.status === 'CONFIRMED');
            if (activeTrades.length === 0) return;

            const nonSolAddresses = Array.from(new Set(
                activeTrades
                    .filter(t => t.asset !== 'SOL' && t.ca)
                    .map(t => t.ca)
            ));

            const prices = await getMultiTokenPrices(nonSolAddresses as string[]);

            setTrades(prev => prev.map(trade => {
                if (trade.status !== 'CONFIRMED') return trade;

                const currentPrice = trade.asset === 'SOL' ? solPrice : (prices[trade.ca] || trade.currentPrice);
                const pnlPercent = ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100;
                const pnlUsd = (pnlPercent / 100) * (parseFloat(trade.amount) * (trade.asset === 'SOL' ? solPrice : trade.entryPrice));

                return {
                    ...trade,
                    currentPrice,
                    pnlPercent: isNaN(pnlPercent) ? 0 : pnlPercent,
                    pnlUsd: isNaN(pnlUsd) ? 0 : pnlUsd
                };
            }));
        };

        const interval = setInterval(monitorPnL, 10000); // 10s PnL refresh
        return () => clearInterval(interval);
    }, [trades, solPrice]);

    // Auto-Sell Monitoring
    useEffect(() => {
        if (!autoSell) return;

        const monitor = setInterval(() => {
            trades.forEach(trade => {
                if (trade.status === 'CONFIRMED' && trade.type === 'BUY') {
                    if (trade.pnlPercent >= parseFloat(takeProfit) || trade.pnlPercent <= -parseFloat(stopLoss)) {
                        setStatus(`AUTO_SELL: Target Hit for ${trade.asset}! PnL: ${trade.pnlPercent.toFixed(2)}%`);
                        handleTrade('SELL');
                    }
                }
            });
        }, 5000);

        return () => clearInterval(monitor);
    }, [autoSell, trades, takeProfit, stopLoss]);

    const handleTrade = async (type: 'BUY' | 'SELL' | 'SNIPE') => {
        if (!publicKey) {
            setStatus('Please connect your wallet first.');
            return;
        }

        const tradeId = Math.random().toString(36).substring(7);
        const currentTokenPrice = tokenInfo ? tokenInfo.price : solPrice;

        const newTrade: Trade = {
            id: tradeId,
            time: new Date().toLocaleTimeString(),
            type,
            ca: snipeMode ? contractAddress : 'SOL',
            asset: snipeMode && tokenInfo ? tokenInfo.symbol : 'SOL',
            assetName: snipeMode && tokenInfo ? tokenInfo.name : 'Solana',
            logo: (snipeMode && tokenInfo ? tokenInfo.logo : null) || null,
            amount: amount,
            entryPrice: currentTokenPrice,
            currentPrice: currentTokenPrice,
            pnlPercent: 0,
            pnlUsd: 0,
            status: 'PROCESSING',
            sig: null
        };

        setTrades(prev => [newTrade, ...prev]);

        try {
            const action = type === 'SNIPE' ? 'SNIPING' : `${type}ing`;
            setStatus(`Initiating ${action} order for ${newTrade.asset}...`);

            // Jupiter Swap Logic
            const inputMint = (type === 'BUY' || type === 'SNIPE') ? 'So11111111111111111111111111111111111111112' : (contractAddress || 'So11111111111111111111111111111111111111112');
            const outputMint = (type === 'BUY' || type === 'SNIPE') ? (contractAddress || 'So11111111111111111111111111111111111111112') : 'So11111111111111111111111111111111111111112';

            // Amount in lamports/units (assuming 9 decimals for SOL, need improvements for other tokens if sell)
            // For simplicity, we are handling SOL amount mostly. If selling a token, we need its decimals.
            // Usually input `amount` is in UI terms (SOL or Tokens). 
            // Let's implement BUY/SNIPE (SOL -> Token) flow robustly first.
            const amountInLamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);

            if (type === 'SELL' && (!tokenInfo || !balance)) { // Simple check, real implementation needs token account balance
                throw new Error('Sell not fully simulated without token balance check');
            }

            // Get Quote
            const quote = await getQuote({
                inputMint,
                outputMint,
                amount: amountInLamports,
                slippageBps: parseFloat(slippage) * 100
            });

            if (!quote) throw new Error('No quote found');

            // Create Swap Transaction
            const swapResult = await createSwapTransaction(quote, publicKey.toString());

            if (!swapResult || !swapResult.swapTransaction) throw new Error('Failed to create swap transaction');

            // Deserialize and Sign
            const swapTransactionBuf = Buffer.from(swapResult.swapTransaction, 'base64');
            const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

            const signature = await sendTransaction(transaction, connection);

            // Confirm
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            }, 'confirmed');

            setTrades(prev => prev.map(t =>
                t.id === tradeId ? { ...t, status: 'CONFIRMED', sig: signature } : t
            ));

            setStatus(`${type} successful! [${newTrade.asset}] @ $${currentTokenPrice.toFixed(4)}. Sig: ${signature.slice(0, 8)}...`);
        } catch (err: unknown) {
            console.error(err);
            setTrades(prev => prev.map(t =>
                t.id === tradeId ? { ...t, status: 'FAILED' } : t
            ));
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setStatus(`Error: ${errorMessage} (Ensure Balance/RPC)`);
        }
    };

    const usdBalance = balance ? (balance * solPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0b0d',
            color: '#e6e8ea',
            fontFamily: 'Inter, sans-serif',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <header style={{
                padding: '1rem 2rem',
                borderBottom: '1px solid #2b2f36',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#121619'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>SOLANA_SNIPER_V1</h1>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ fontSize: '0.6rem', background: '#1e2329', padding: '2px 8px', borderRadius: '4px', color: '#f0b90b' }}>MAINNET_FAST</span>
                        <span style={{ fontSize: '0.6rem', background: snipeMode ? '#f6465d' : '#2ebd85', padding: '2px 8px', borderRadius: '4px', color: '#fff' }}>
                            {snipeMode ? 'SNIPE_ACTIVE' : 'STANDARD_MODE'}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {snipeMode && (
                        <button
                            onClick={() => setAutoSnipe(!autoSnipe)}
                            style={{
                                background: autoSnipe ? 'rgba(240, 185, 11, 0.1)' : 'rgba(132, 142, 156, 0.1)',
                                border: `1px solid ${autoSnipe ? '#f0b90b' : '#2b2f36'}`,
                                color: autoSnipe ? '#f0b90b' : '#848e9c',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: autoSnipe ? '#f0b90b' : '#848e9c',
                                boxShadow: autoSnipe ? '0 0 10px #f0b90b' : 'none'
                            }} />
                            AUTO_SNIPE: {autoSnipe ? 'ON' : 'OFF'}
                        </button>
                    )}
                    {snipeMode && (
                        <button
                            onClick={() => setAutoDiscovery(!autoDiscovery)}
                            style={{
                                background: autoDiscovery ? 'rgba(1, 205, 254, 0.1)' : 'rgba(132, 142, 156, 0.1)',
                                border: `1px solid ${autoDiscovery ? '#01cdfe' : '#2b2f36'}`,
                                color: autoDiscovery ? '#01cdfe' : '#848e9c',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: autoDiscovery ? '#01cdfe' : '#848e9c',
                                boxShadow: autoDiscovery ? '0 0 10px #01cdfe' : 'none'
                            }} />
                            AUTO_DISCOVERY
                        </button>
                    )}
                    <button
                        onClick={() => setSnipeMode(!snipeMode)}
                        style={{
                            background: snipeMode ? 'rgba(246, 70, 93, 0.1)' : 'rgba(46, 189, 133, 0.1)',
                            border: `1px solid ${snipeMode ? '#f6465d' : '#2ebd85'}`,
                            color: snipeMode ? '#f6465d' : '#2ebd85',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        TOGGLE_SNIPER
                    </button>
                    <WalletMultiButton />
                </div>
            </header>

            <main style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: '1fr 380px',
                padding: '1rem',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Portfolio Summary Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div style={statBox}>
                            <label style={statLabel}>WALLET_BALANCE</label>
                            <span style={statValue}>{balance !== null ? balance.toFixed(4) : '0.0000'} SOL</span>
                            <span style={{ fontSize: '0.7rem', color: '#2ebd85' }}>≈ ${usdBalance} USD</span>
                        </div>
                        <div style={statBox}>
                            <label style={statLabel}>POSITION_VALUE</label>
                            <span style={statValue}>$0.00</span>
                            <span style={{ fontSize: '0.7rem', color: '#848e9c' }}>0 ACTIVE_BETS</span>
                        </div>
                        <div style={statBox}>
                            <label style={statLabel}>SESSION_PnL</label>
                            <span style={{ ...statValue, color: '#848e9c' }}>+$0.00</span>
                            <span style={{ fontSize: '0.7rem', color: '#848e9c' }}>0.00%</span>
                        </div>
                    </div>

                    {/* Viewport: Chart or Token Scanner */}
                    <div style={{
                        flex: 1,
                        background: '#121619',
                        borderRadius: '8px',
                        border: '1px solid #2b2f36',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {snipeMode && tokenInfo ? (
                            <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        {tokenInfo.logo && <img src={tokenInfo.logo} style={{ width: '40px', height: '40px', borderRadius: '50%' }} alt="logo" />}
                                        <div>
                                            <h2 style={{ fontSize: '2rem', margin: 0 }}>{tokenInfo.name} ({tokenInfo.symbol})</h2>
                                            <p style={{ fontFamily: 'monospace', opacity: 0.5, fontSize: '0.8rem', margin: 0 }}>{contractAddress}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '1.5rem', color: '#2ebd85', fontWeight: 700 }}>${tokenInfo.price.toFixed(4)}</span>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>MOBULA_LIVE_FEED</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                    <div style={{ ...statBox, background: '#121619', border: '1px solid #2b2f36' }}>
                                        <label style={statLabel}>LIQUIDITY</label>
                                        <span style={statValue}>${tokenInfo.liquidity.toLocaleString()}</span>
                                    </div>
                                    <div style={{ ...statBox, background: '#121619', border: '1px solid #2b2f36' }}>
                                        <label style={statLabel}>MARKET CAP</label>
                                        <span style={statValue}>${tokenInfo.market_cap.toLocaleString()}</span>
                                    </div>
                                    <div style={{ ...statBox, background: '#121619', border: '1px solid #2b2f36' }}>
                                        <label style={statLabel}>BURN_EST</label>
                                        <span style={{ ...statValue, color: '#2ebd85' }}>SECURE</span>
                                    </div>
                                    <div style={{ ...statBox, background: '#121619', border: '1px solid #2b2f36' }}>
                                        <label style={statLabel}>MINT_AUTH</label>
                                        <span style={{ ...statValue, color: '#f6465d' }}>RENNOUNCED</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <iframe
                                src={`https://www.tradingview.com/chart-embed/?symbol=${snipeMode ? 'SOLUSDT' : 'SOLUSDT'}`}
                                style={{ width: '100%', height: '100%', border: 'none' }}
                            />
                        )}
                    </div>

                    {/* Trade Ledger / Transaction History */}
                    <div style={{
                        height: '250px',
                        background: '#121619',
                        borderRadius: '8px',
                        border: '1px solid #2b2f36',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #2b2f36', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '0.8rem', margin: 0, opacity: 0.6, letterSpacing: '2px' }}>TRADE_LEDGER</h3>
                            <span style={{ fontSize: '0.65rem', color: '#848e9c' }}>{trades.length} TRANSACTIONS</span>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                                <thead style={{ position: 'sticky', top: 0, background: '#121619', color: '#848e9c' }}>
                                    <tr>
                                        <th style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #2b2f36' }}>TIME</th>
                                        <th style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #2b2f36' }}>ASSET</th>
                                        <th style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #2b2f36' }}>ENTRY</th>
                                        <th style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #2b2f36' }}>AMOUNT</th>
                                        <th style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #2b2f36' }}>PnL</th>
                                        <th style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #2b2f36' }}>STATUS</th>
                                        <th style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #2b2f36' }}>TX</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trades.map((trade) => (
                                        <tr key={trade.id} style={{ borderBottom: '1px solid #1e2329' }}>
                                            <td style={{ padding: '0.8rem 1rem', opacity: 0.5 }}>{trade.time}</td>
                                            <td style={{ padding: '0.8rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {trade.logo && <img src={trade.logo} style={{ width: '16px', height: '16px', borderRadius: '50%' }} alt="" />}
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: trade.type === 'SELL' ? '#f6465d' : '#2ebd85' }}>
                                                            {trade.type} {trade.asset}
                                                        </div>
                                                        <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>{trade.assetName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.8rem 1rem' }}>${trade.entryPrice?.toFixed(4) || '---'}</td>
                                            <td style={{ padding: '0.8rem 1rem' }}>{trade.amount} SOL</td>
                                            <td style={{ padding: '0.8rem 1rem' }}>
                                                <div style={{ color: trade.pnlPercent >= 0 ? '#2ebd85' : '#f6465d', fontWeight: 700 }}>
                                                    {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                                                </div>
                                                <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>
                                                    {trade.pnlUsd >= 0 ? '+' : ''}${trade.pnlUsd.toFixed(2)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.8rem 1rem' }}>
                                                <span style={{
                                                    padding: '2px 6px',
                                                    borderRadius: '2px',
                                                    fontSize: '0.6rem',
                                                    background: trade.status === 'CONFIRMED' ? 'rgba(46, 189, 133, 0.1)' : 'rgba(240, 185, 11, 0.1)',
                                                    color: trade.status === 'CONFIRMED' ? '#2ebd85' : '#f0b90b'
                                                }}>{trade.status}</span>
                                            </td>
                                            <td style={{ padding: '0.8rem 1rem' }}>
                                                {trade.sig ? (
                                                    <a href={`https://solscan.io/tx/${trade.sig}`} target="_blank" style={{ color: '#01cdfe', textDecoration: 'none' }}>EXE</a>
                                                ) : '---'}
                                            </td>
                                        </tr>
                                    ))}
                                    {trades.length === 0 && (
                                        <tr>
                                            <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', opacity: 0.2 }}>NO_TRANSACTIONS_IN_MEMORY</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right side: Sniper Controls */}
                <div style={{
                    background: '#121619',
                    borderRadius: '8px',
                    border: '1px solid #2b2f36',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.2rem'
                }}>
                    <div style={{ borderBottom: '1px solid #2b2f36', paddingBottom: '1rem' }}>
                        <h2 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#fff', letterSpacing: '1px' }}>
                            {snipeMode ? 'SNIPE_CONFIG' : 'TRADE_CONFIG'}
                        </h2>
                        {status && (
                            <div style={{ fontSize: '0.65rem', color: '#f0b90b', fontFamily: 'monospace' }}>
                                &gt; {status}
                            </div>
                        )}
                    </div>

                    {snipeMode && (
                        <div>
                            <label style={inputLabel}>CONTRACT_ADDRESS</label>
                            <input
                                placeholder="Enter Token CA"
                                value={contractAddress}
                                onChange={(e) => setContractAddress(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={inputLabel}>AMOUNT (SOL)</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={inputLabel}>SLIPPAGE (%)</label>
                            <input type="number" value={slippage} onChange={(e) => setSlippage(e.target.value)} style={inputStyle} />
                        </div>
                    </div>

                    <div>
                        <label style={inputLabel}>PRIORITY_FEE (SOL)</label>
                        <input type="number" value={priorityFee} onChange={(e) => setPriorityFee(e.target.value)} style={inputStyle} />
                    </div>

                    <div style={{ borderTop: '1px solid #2b2f36', paddingTop: '1rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <label style={{ ...inputLabel, margin: 0 }}>AUTO_SELL_ROUTINE</label>
                            <button
                                onClick={() => setAutoSell(!autoSell)}
                                style={{
                                    background: autoSell ? '#2ebd85' : '#1e2329',
                                    border: 'none',
                                    width: '40px',
                                    height: '20px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    background: '#fff',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '2px',
                                    left: autoSell ? '22px' : '2px',
                                    transition: 'all 0.2s'
                                }} />
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={inputLabel}>TAKE_PROFIT (%)</label>
                                <input type="number" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={inputLabel}>STOP_LOSS (%)</label>
                                <input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {snipeMode ? (
                            <button
                                onClick={() => handleTrade('SNIPE')}
                                style={{
                                    ...actionButton,
                                    background: '#f6465d',
                                    height: '60px',
                                    fontSize: '1.2rem'
                                }}
                            >
                                INSTANT_SNIPE
                            </button>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button onClick={() => handleTrade('BUY')} style={{ ...actionButton, background: '#2ebd85' }}>BUY</button>
                                <button onClick={() => handleTrade('SELL')} style={{ ...actionButton, background: '#f6465d' }}>SELL</button>
                            </div>
                        )}
                        <p style={{ fontSize: '0.65rem', color: '#848e9c', textAlign: 'center', margin: 0 }}>
                            {snipeMode ? 'MODE: AGGRESSIVE_SNIPE' : 'MODE: STANDARD_EXECUTION'}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

const statBox = {
    background: '#1e2329',
    padding: '1rem',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px'
};

const statLabel = {
    fontSize: '0.6rem',
    color: '#848e9c',
    letterSpacing: '1px'
};

const statValue = {
    fontSize: '1rem',
    fontWeight: 700
};

const inputLabel = {
    fontSize: '0.7rem',
    color: '#848e9c',
    display: 'block',
    marginBottom: '0.4rem',
    letterSpacing: '1px'
};

const inputStyle = {
    width: '100%',
    background: '#1e2329',
    border: '1px solid #2b2f36',
    borderRadius: '4px',
    padding: '10px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'monospace'
};

const actionButton = {
    width: '100%',
    padding: '1rem',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontWeight: 900,
    cursor: 'pointer',
    letterSpacing: '2px',
    transition: 'opacity 0.2s'
};

export default function BotPage() {
    return (
        <SolanaProvider>
            <BotInterface />
        </SolanaProvider>
    );
}
