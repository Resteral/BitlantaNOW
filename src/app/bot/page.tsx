'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js';
import { SolanaProvider } from '@/components/SolanaProvider';

function BotInterface() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);
    const [amount, setAmount] = useState('0.1');
    const [status, setStatus] = useState<string | null>(null);

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

    const handleTrade = async (type: 'BUY' | 'SELL') => {
        if (!publicKey) {
            setStatus('Please connect your wallet first.');
            return;
        }

        try {
            setStatus(`Initiating ${type} order...`);
            // This is a placeholder for actual swap logic (e.g., Jupiter API)
            // For now, it just simulates a small SOL transfer to a burn address or self
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: publicKey, // Sending to self as a test
                    lamports: 1000, // Minimal lamports
                })
            );

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'processed');

            setStatus(`${type} order successful! Sig: ${signature.slice(0, 8)}...`);
        } catch (err: any) {
            console.error(err);
            setStatus(`Error: ${err.message}`);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0b0d', // Professional dark gray
            color: '#e6e8ea',
            fontFamily: 'Inter, sans-serif',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Navigation / Header */}
            <header style={{
                padding: '1rem 2rem',
                borderBottom: '1px solid #2b2f36',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#121619'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>SOLANA_BOT_V1</h1>
                    <span style={{
                        fontSize: '0.7rem',
                        background: '#1e2329',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        color: '#f0b90b' // Binance Yellow for a "realistic" touch
                    }}>MAINNET_RPC</span>
                </div>
                <WalletMultiButton />
            </header>

            <main style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: '1fr 350px',
                padding: '1rem',
                gap: '1rem'
            }}>
                {/* Left side: Chart and History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Mock Chart Area */}
                    <div style={{
                        flex: 1,
                        background: '#121619',
                        borderRadius: '8px',
                        border: '1px solid #2b2f36',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <iframe
                            src="https://www.tradingview.com/chart-embed/?symbol=SOLUSDT"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                    </div>

                    {/* Transaction History Area */}
                    <div style={{
                        height: '250px',
                        background: '#121619',
                        borderRadius: '8px',
                        border: '1px solid #2b2f36',
                        padding: '1rem',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.6 }}>TRANSACTION_LOG</h3>
                        <div style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                            {status && (
                                <div style={{ color: '#f0b90b', marginBottom: '0.5rem' }}>
                                    {`[${new Date().toLocaleTimeString()}] ${status}`}
                                </div>
                            )}
                            <div style={{ opacity: 0.3 }}>Waiting for user action...</div>
                        </div>
                    </div>
                </div>

                {/* Right side: Trading Controls */}
                <div style={{
                    background: '#121619',
                    borderRadius: '8px',
                    border: '1px solid #2b2f36',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                }}>
                    <div style={{ borderBottom: '1px solid #2b2f36', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>EXECUTION_TERMINAL</h2>
                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                            Wallet Balance: {balance !== null ? `${balance.toFixed(4)} SOL` : '----'}
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginBottom: '0.5rem' }}>AMOUNT (SOL)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            style={{
                                width: '100%',
                                background: '#1e2329',
                                border: '1px solid #2b2f36',
                                borderRadius: '4px',
                                padding: '12px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: 'auto' }}>
                        <button
                            onClick={() => handleTrade('BUY')}
                            style={{
                                padding: '1rem',
                                background: '#2ebd85',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'opacity 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            BUY
                        </button>
                        <button
                            onClick={() => handleTrade('SELL')}
                            style={{
                                padding: '1rem',
                                background: '#f6465d',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'opacity 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            SELL
                        </button>
                    </div>

                    <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: '#848e9c', textAlign: 'center' }}>
                        * Execution via localized RPC nodes.
                        Ensure sufficient SOL for gas.
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function BotPage() {
    return (
        <SolanaProvider>
            <BotInterface />
        </SolanaProvider>
    );
}
