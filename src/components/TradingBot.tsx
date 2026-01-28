'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface BotSettings {
    id: string;
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
            .eq('id', settings.id);

        if (!error) {
            setSettings({ ...settings, is_active: newStatus });
        }
    };

    const updateAmount = async (amount: number) => {
        if (!settings) return;
        const { error } = await supabase
            .from('bot_settings')
            .update({ default_trade_amount: amount })
            .eq('id', settings.id);

        if (!error) {
            setSettings({ ...settings, default_trade_amount: amount });
        }
    };

    if (loading) return <div style={{ opacity: 0.5, fontStyle: 'italic', letterSpacing: '2px' }}>AWAKENING BOT CORE...</div>;

    return (
        <div style={{
            padding: '3rem',
            background: 'rgba(26, 11, 46, 0.4)',
            backdropFilter: 'blur(30px)',
            borderRadius: '40px',
            border: '1px solid rgba(255, 113, 206, 0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            maxWidth: '600px',
            width: '100%'
        }}>
            <h3 style={{ color: '#fff', marginBottom: '2.5rem', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 300, fontSize: '1.2rem', textAlign: 'center' }}>
                Ether-Bot Console
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '2px', fontWeight: 700, marginBottom: '0.5rem' }}>SYSTEM_STATUS</div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color: settings?.is_active ? 'var(--vw-blue)' : 'var(--vw-magenta)', letterSpacing: '1px' }}>
                        {settings?.is_active ? '● ONLINE' : '○ ASLEEP'}
                    </div>
                </div>
                <button
                    onClick={toggleBot}
                    className="vapor-toggle-btn"
                    style={{
                        padding: '1rem 2rem',
                        background: settings?.is_active ? 'rgba(255, 113, 206, 0.1)' : 'rgba(1, 205, 254, 0.1)',
                        border: `1px solid ${settings?.is_active ? 'var(--vw-magenta)' : 'var(--vw-cyan)'}`,
                        color: settings?.is_active ? 'var(--vw-magenta)' : 'var(--vw-cyan)',
                        borderRadius: '100px',
                        cursor: 'pointer',
                        fontWeight: 900,
                        fontSize: '0.7rem',
                        letterSpacing: '2px',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                >
                    {settings?.is_active ? 'SHUTDOWN' : 'BOOT UP'}
                </button>
            </div>

            <div style={{ marginBottom: '3rem' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.8rem', letterSpacing: '2px', fontWeight: 700 }}>TRANSMISSION_MAGNITUDE (USDC)</div>
                <input
                    type="number"
                    value={settings?.default_trade_amount}
                    onChange={(e) => updateAmount(Number(e.target.value))}
                    style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '1.2rem',
                        color: '#fff',
                        borderRadius: '16px',
                        fontSize: '1rem',
                        outline: 'none',
                        textAlign: 'center',
                        letterSpacing: '4px',
                        fontWeight: 300
                    }}
                />
            </div>

            <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '1.5rem', letterSpacing: '2px', fontWeight: 700 }}>PAST_TRANSMISSIONS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {trades.map(trade => (
                        <div key={trade.id} style={{
                            padding: '1rem 1.2rem',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid rgba(255,255,255,0.03)'
                        }}>
                            <span style={{ fontWeight: 300, fontStyle: 'italic' }}>
                                <span style={{ color: trade.type === 'BUY' ? 'var(--vw-cyan)' : 'var(--vw-magenta)', fontWeight: 900, marginRight: '0.5rem' }}>{trade.type}</span>
                                {trade.pair}
                            </span>
                            <span style={{ color: trade.type === 'BUY' ? 'var(--vw-cyan)' : 'var(--vw-magenta)', fontWeight: 900, letterSpacing: '1px' }}>
                                ${trade.total_val}
                            </span>
                        </div>
                    ))}
                    {trades.length === 0 && <div style={{ opacity: 0.3, padding: '2rem', textAlign: 'center', fontStyle: 'italic' }}>MEMORIES ARE BLANK</div>}
                </div>
            </div>
            <style jsx>{`
                .vapor-toggle-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 0 20px ${settings?.is_active ? 'rgba(255, 113, 206, 0.4)' : 'rgba(1, 205, 254, 0.4)'};
                }
            `}</style>
        </div>
    );
}
