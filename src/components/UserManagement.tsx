'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface UserTier {
    id: string;
    tier: 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD';
    updated_at: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<UserTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        const { data, error } = await supabase
            .from('user_tiers')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            setError(error.message);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const loadInitial = async () => {
            const { data, error } = await supabase
                .from('user_tiers')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) {
                setError(error.message);
            } else {
                setUsers(data || []);
            }
            setLoading(false);
        };
        loadInitial();
    }, []);

    const updateTier = async (userId: string, newTier: UserTier['tier']) => {
        const { error } = await supabase
            .from('user_tiers')
            .update({ tier: newTier, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) {
            alert('Failed to update tier: ' + error.message);
        } else {
            setUsers(users.map(u => u.id === userId ? { ...u, tier: newTier } : u));
        }
    };

    if (loading) return <div style={{ opacity: 0.5, fontStyle: 'italic', letterSpacing: '2px' }}>DECRYPTING USER RECORDS...</div>;
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
                            <th style={{ padding: '0.8rem', color: '#fff', fontWeight: 700, letterSpacing: '2px' }}>ID</th>
                            <th style={{ padding: '0.8rem', color: '#fff', fontWeight: 700, letterSpacing: '2px' }}>TIER</th>
                            <th style={{ padding: '0.8rem', color: '#fff', fontWeight: 700, letterSpacing: '2px' }}>ACCESS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '1rem 0.8rem', fontFamily: 'monospace', opacity: 0.5 }}>
                                    {user.id.slice(0, 8)}
                                </td>
                                <td style={{ padding: '1rem 0.8rem' }}>
                                    <span style={{
                                        color: getTierColor(user.tier),
                                        fontWeight: 900,
                                        textShadow: `0 0 10px ${getTierColor(user.tier)}66`
                                    }}>
                                        {user.tier}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 0.8rem' }}>
                                    <select
                                        value={user.tier}
                                        onChange={(e) => updateTier(user.id, e.target.value as UserTier['tier'])}
                                        style={{
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            padding: '0.4rem 0.6rem',
                                            fontSize: '0.7rem',
                                            cursor: 'pointer',
                                            borderRadius: '8px',
                                            outline: 'none'
                                        }}
                                    >
                                        <option value="FREE">FREE</option>
                                        <option value="BRONZE">BRONZE</option>
                                        <option value="SILVER">SILVER</option>
                                        <option value="GOLD">GOLD</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.3, fontStyle: 'italic' }}>
                        VACANT MEMORY SLOTS
                    </div>
                )}
            </div>

            <button
                onClick={() => { setLoading(true); fetchUsers(); }}
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
                REFRESH DATA
            </button>
            <style jsx>{`
                .vapor-sub-btn:hover {
                    background: rgba(255,113,206,0.1);
                    border-color: var(--vw-magenta);
                    color: #fff;
                }
            `}</style>
        </div>
    );
}

function getTierColor(tier: string) {
    switch (tier) {
        case 'GOLD': return 'var(--vw-yellow)';
        case 'SILVER': return 'var(--vw-cyan)';
        case 'BRONZE': return 'var(--vw-magenta)';
        default: return 'var(--vw-blue)';
    }
}
