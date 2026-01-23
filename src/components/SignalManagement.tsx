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

    if (loading) return <div style={{ opacity: 0.5 }}>FETCHING SIGNAL HISTORY...</div>;
    if (error) return <div style={{ color: '#ff4d4d' }}>ERROR: {error}</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                paddingRight: '0.5rem'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                            <th style={{ padding: '0.5rem', opacity: 0.6 }}>PAIR</th>
                            <th style={{ padding: '0.5rem', opacity: 0.6 }}>STATUS</th>
                            <th style={{ padding: '0.5rem', opacity: 0.6 }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {signals.map(signal => (
                            <tr key={signal.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '0.75rem 0.5rem' }}>
                                    <div style={{ fontWeight: 'bold' }}>{signal.pair}</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{signal.type} @ {signal.entry_price}</div>
                                </td>
                                <td style={{ padding: '0.75rem 0.5rem' }}>
                                    <span style={{
                                        color: signal.status === 'ACTIVE' ? 'var(--neon-green)' : '#999',
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase'
                                    }}>
                                        {signal.status}
                                    </span>
                                </td>
                                <td style={{ padding: '0.75rem 0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {signal.status === 'ACTIVE' && (
                                            <button
                                                onClick={() => updateStatus(signal.id, 'CLOSED')}
                                                style={actionButtonStyle('#39ff14')}
                                            >
                                                CLOSE
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteSignal(signal.id)}
                                            style={actionButtonStyle('#ff4d4d')}
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
                    <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.3 }}>
                        NO SIGNALS LOGGED
                    </div>
                )}
            </div>

            <button
                onClick={fetchSignals}
                style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'rgba(255,255,255,0.5)',
                    padding: '0.5rem',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    alignSelf: 'flex-start'
                }}
            >
                REFRESH SIGNALS
            </button>
        </div>
    );
}

const actionButtonStyle = (color: string) => ({
    background: 'transparent',
    border: `1px solid ${color}`,
    color: color,
    padding: '0.2rem 0.5rem',
    fontSize: '0.7rem',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
});
