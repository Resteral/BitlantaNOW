'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js';
import { SolanaProvider } from '@/components/SolanaProvider';

import dynamic from 'next/dynamic';

const BotInterface = dynamic(() => Promise.resolve(BotInterfaceInternal), {
    ssr: false,
});

function BotInterfaceInternal() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);
    const [amount, setAmount] = useState('0.1');
    const [status, setStatus] = useState<string | null>(null);

    // Sniper Specific State
    const [snipeMode, setSnipeMode] = useState(false);
    const [autoSnipe, setAutoSnipe] = useState(false);
    const [contractAddress, setContractAddress] = useState('');
    const [slippage, setSlippage] = useState('15');
    const [priorityFee, setPriorityFee] = useState('0.001');
    const [tokenInfo, setTokenInfo] = useState<{ name: string; symbol: string; price: string } | null>(null);

    useEffect(() => {
        if (!publicKey) return;

        const getBalance = async () => {
            const info = await connection.getAccountInfo(publicKey);
            if (info) {
                setBalance(info.lamports / LAMPORTS_PER_SOL);
            }
        };

        getBalance();
        const id = connection.onAccountChange(publicKey, (account) => {
            setBalance(account.lamports / LAMPORTS_PER_SOL);
        });

        return () => {
            connection.removeAccountChangeListener(id);
        };
    }, [publicKey, connection]);

    // Mock token lookup & Auto-Snipe trigger
    useEffect(() => {
        if (contractAddress.length > 30) {
            setTokenInfo({
                name: 'HyperLiquid Mock',
                symbol: 'HYPER',
                price: '$0.00042'
            });

            if (autoSnipe && snipeMode) {
                handleTrade('SNIPE');
            }
        } else {
            setTokenInfo(null);
        }
    }, [contractAddress, autoSnipe, snipeMode]);

    const handleTrade = async (type: 'BUY' | 'SELL' | 'SNIPE') => {
        if (!publicKey) {
            setStatus('Please connect your wallet first.');
            return;
        }

        try {
            const action = type === 'SNIPE' ? 'SNIPING' : `${type}ing`;
            setStatus(`Initiating ${action} order...`);

            // Transaction simulation
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: publicKey,
                    lamports: 1000,
                })
            );

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'processed');

            setStatus(`${type} successful! Slippage: ${slippage}%, Fee: ${priorityFee} SOL. Sig: ${signature.slice(0, 8)}...`);
        } catch (err: any) {
            console.error(err);
            setStatus(`Error: ${err.message}`);
        }
    };

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
                                    <div>
                                        <h2 style={{ fontSize: '2rem', margin: 0 }}>{tokenInfo.name} ({tokenInfo.symbol})</h2>
                                        <p style={{ fontFamily: 'monospace', opacity: 0.5, fontSize: '0.8rem' }}>{contractAddress}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '1.5rem', color: '#2ebd85', fontWeight: 700 }}>{tokenInfo.price}</span>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>LIVE_MARKET_DATA</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                    <div style={statBox}>
                                        <label style={statLabel}>LIQUIDITY</label>
                                        <span style={statValue}>$142,500</span>
                                    </div>
                                    <div style={statBox}>
                                        <label style={statLabel}>BURNED</label>
                                        <span style={{ ...statValue, color: '#2ebd85' }}>100%</span>
                                    </div>
                                    <div style={statBox}>
                                        <label style={statLabel}>MINT</label>
                                        <span style={{ ...statValue, color: '#f6465d' }}>RENNOUNCED</span>
                                    </div>
                                    <div style={statBox}>
                                        <label style={statLabel}>MARKET CAP</label>
                                        <span style={statValue}>$4.2M</span>
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

                    <div style={{
                        height: '200px',
                        background: '#121619',
                        borderRadius: '8px',
                        border: '1px solid #2b2f36',
                        padding: '1rem',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ fontSize: '0.8rem', marginBottom: '1rem', opacity: 0.6, letterSpacing: '2px' }}>EXECUTION_LOG</h3>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                            {status && (
                                <div style={{ color: '#f0b90b', marginBottom: '0.5rem', borderLeft: '2px solid #f0b90b', paddingLeft: '8px' }}>
                                    {`[${new Date().toLocaleTimeString()}] ${status}`}
                                </div>
                            )}
                            <div style={{ opacity: 0.2 }}>Initializing neural link... established.</div>
                            <div style={{ opacity: 0.2 }}>Waiting for user heartbeat...</div>
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
                        <div style={{ fontSize: '0.75rem', color: '#848e9c' }}>
                            WALLET: {balance !== null ? `${balance.toFixed(4)} SOL` : 'NOT_CONNECTED'}
                        </div>
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
    flexDirection: 'column' as 'column',
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
