'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface BotSettings {
    is_active: boolean;
    default_trade_amount: number;
}

interface Trade {
    id: string;
    pair: string;
    type: 'BUY' | 'SELL';
    price: number;
    amount: number;
    total_val: number;
    tx_hash: string;
    created_at: string;
}

export default function TradingBot() {
    const [settings, setSettings] = useState<BotSettings | null>(null);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const { data: settingsData } = await supabase
                .from('bot_settings')
                .select('*')
                .single();

            const { data: tradesData } = await supabase
                .from('trades')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (settingsData) setSettings(settingsData);
            if (tradesData) setTrades(tradesData);
            setLoading(false);
        }
        fetchData();
    }, []);

    const toggleBot = async () => {
        if (!settings) return;
        const newStatus = !settings.is_active;
        const { error } = await supabase
            .from('bot_settings')
            .update({ is_active: newStatus })
            .eq('id', (settings as any).id);

        if (!error) {
            setSettings({ ...settings, is_active: newStatus });
        }
    };

    const updateAmount = async (amount: number) => {
        if (!settings) return;
        const { error } = await supabase
            .from('bot_settings')
            .update({ default_trade_amount: amount })
            .eq('id', (settings as any).id);

        if (!error) {
            setSettings({ ...settings, default_trade_amount: amount });
        }
    };

    if (loading) return <div>INITIALIZING BOT SYSTEMS...</div>;

    return (
        <div style={{
            padding: '2rem',
            background: 'rgba(26, 11, 46, 0.8)',
            borderRadius: '20px',
            border: '1px solid var(--neon-purple)',
            boxShadow: '0 0 30px rgba(188, 19, 254, 0.2)',
            maxWidth: '600px',
            width: '100%'
        }}>
            <h3 style={{ color: 'var(--neon-green)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Solana Meme Bot Console
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>BOT STATUS</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: settings?.is_active ? 'var(--neon-green)' : '#ff4d4d' }}>
                        {settings?.is_active ? '● OPERATIONAL' : '○ STANDBY'}
                    </div>
                </div>
                <button
                    onClick={toggleBot}
                    style={{
                        padding: '0.8rem 1.5rem',
                        background: settings?.is_active ? 'rgba(255, 77, 77, 0.1)' : 'rgba(57, 255, 20, 0.1)',
                        border: `1px solid ${settings?.is_active ? '#ff4d4d' : 'var(--neon-green)'}`,
                        color: settings?.is_active ? '#ff4d4d' : 'var(--neon-green)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 800
                    }}
                >
                    {settings?.is_active ? 'DEACTIVATE' : 'ACTIVATE'}
                </button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>DEFAULT TRADE AMOUNT (USDC)</div>
                <input
                    type="number"
                    value={settings?.default_trade_amount}
                    onChange={(e) => updateAmount(Number(e.target.value))}
                    style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '1rem',
                        color: '#fff',
                        borderRadius: '8px',
                        fontSize: '1.1rem'
                    }}
                />
            </div>

            <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>RECENT TRANSMISSIONS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {trades.map(trade => (
                        <div key={trade.id} style={{
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                            <span>{trade.type} {trade.pair} @ ${trade.price}</span>
                            <span style={{ color: trade.type === 'BUY' ? 'var(--neon-green)' : '#ff4d4d' }}>
                                ${trade.total_val}
                            </span>
                        </div>
                    ))}
                    {trades.length === 0 && <div style={{ opacity: 0.3 }}>NO TRADES LOGGED</div>}
                </div>
            </div>
        </div>
    );
}
