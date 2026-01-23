'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Signal {
    id: string;
    pair: string;
    type: 'LONG' | 'SHORT';
    entry_price: number;
    target_price?: number;
    stop_loss?: number;
    status: 'ACTIVE' | 'CLOSED' | 'CANCELED';
    tier: 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD';
    created_at: string;
}

export default function SignalManagement() {
    const [signals, setSignals] = useState<Signal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSignals = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('signals')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            setError(error.message);
        } else {
            setSignals(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSignals();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('signals')
            .update({
                status: newStatus,
                closed_at: newStatus === 'CLOSED' ? new Date().toISOString() : null
            })
            .eq('id', id);

        if (error) {
            alert('Failed to update status: ' + error.message);
        } else {
            setSignals(signals.map(s => s.id === id ? { ...s, status: newStatus as any } : s));
        }
    };

    const deleteSignal = async (id: string) => {
        if (!confirm('Are you sure you want to purge this transmission from history?')) return;

        const { error } = await supabase
            .from('signals')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Failed to delete signal: ' + error.message);
        } else {
            setSignals(signals.filter(s => s.id !== id));
        }
    };

    if (loading) return <div style={{ opacity: 0.5, fontStyle: 'italic', letterSpacing: '2px' }}>INTERCEPTING SIGNALS...</div>;
    if (error) return <div style={{ color: 'var(--vw-magenta)', textShadow: '0 0 10px var(--vw-magenta)' }}>ERROR: {error}</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                paddingRight: '1rem'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                            <th style={{ padding: '0.8rem', color: '#fff', fontWeight: 700, letterSpacing: '2px' }}>PAIR</th>
                            <th style={{ padding: '0.8rem', color: '#fff', fontWeight: 700, letterSpacing: '2px' }}>STATUS</th>
                            <th style={{ padding: '0.8rem', color: '#fff', fontWeight: 700, letterSpacing: '2px' }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {signals.map(signal => (
                            <tr key={signal.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '1rem 0.8rem' }}>
                                    <div style={{ fontWeight: 600, color: '#fff' }}>{signal.pair}</div>
                                    <div style={{ fontSize: '0.65rem', opacity: 0.5, letterSpacing: '1px' }}>{signal.type} @ {signal.entry_price}</div>
                                </td>
                                <td style={{ padding: '1rem 0.8rem' }}>
                                    <span style={{
                                        color: signal.status === 'ACTIVE' ? 'var(--vw-cyan)' : 'var(--text-dim)',
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        fontWeight: 900,
                                        letterSpacing: '1px'
                                    }}>
                                        {signal.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 0.8rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {signal.status === 'ACTIVE' && (
                                            <button
                                                onClick={() => updateStatus(signal.id, 'CLOSED')}
                                                style={actionButtonStyle('var(--vw-cyan)')}
                                            >
                                                CLOSE
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteSignal(signal.id)}
                                            style={actionButtonStyle('var(--vw-magenta)')}
                                        >
                                            DEL
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {signals.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.3, fontStyle: 'italic' }}>
                        NO SIGNALS DETECTED IN THIS SECTOR
                    </div>
                )}
            </div>

            <button
                onClick={fetchSignals}
                className="vapor-sub-btn"
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.65rem',
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                    borderRadius: '100px',
                    letterSpacing: '2px',
                    transition: 'all 0.3s ease'
                }}
            >
                REFRESH FEED
            </button>
            <style jsx>{`
                .vapor-sub-btn:hover {
                    background: rgba(1, 205, 254, 0.1);
                    border-color: var(--vw-cyan);
                    color: #fff;
                }
            `}</style>
        </div>
    );
}

const actionButtonStyle = (color: string) => ({
    background: 'transparent',
    border: `1px solid ${color}`,
    color: color,
    padding: '0.3rem 0.6rem',
    fontSize: '0.65rem',
    cursor: 'pointer',
    borderRadius: '100px',
    fontWeight: 700,
    letterSpacing: '1px',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
});
