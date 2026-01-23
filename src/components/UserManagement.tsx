'use client';

import { useState, useEffect } from 'react';
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

    const fetchUsers = async () => {
        setLoading(true);
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

    useEffect(() => {
        fetchUsers();
    }, []);

    const updateTier = async (userId: string, newTier: string) => {
        const { error } = await supabase
            .from('user_tiers')
            .update({ tier: newTier, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) {
            alert('Failed to update tier: ' + error.message);
        } else {
            setUsers(users.map(u => u.id === userId ? { ...u, tier: newTier as any } : u));
        }
    };

    if (loading) return <div style={{ opacity: 0.5 }}>SYNCHRONIZING USER DATA...</div>;
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
                            <th style={{ padding: '0.5rem', opacity: 0.6 }}>USER ID</th>
                            <th style={{ padding: '0.5rem', opacity: 0.6 }}>CURRENT TIER</th>
                            <th style={{ padding: '0.5rem', opacity: 0.6 }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace' }}>
                                    {user.id.slice(0, 8)}...
                                </td>
                                <td style={{ padding: '0.75rem 0.5rem' }}>
                                    <span style={{
                                        color: getTierColor(user.tier),
                                        fontWeight: 'bold',
                                        textShadow: `0 0 5px ${getTierColor(user.tier)}44`
                                    }}>
                                        {user.tier}
                                    </span>
                                </td>
                                <td style={{ padding: '0.75rem 0.5rem' }}>
                                    <select
                                        value={user.tier}
                                        onChange={(e) => updateTier(user.id, e.target.value)}
                                        style={{
                                            background: 'rgba(0,0,0,0.5)',
                                            border: '1px solid var(--foreground)',
                                            color: 'var(--foreground)',
                                            padding: '0.2rem',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer'
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
                    <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.3 }}>
                        NO USERS REGISTERED
                    </div>
                )}
            </div>

            <button
                onClick={fetchUsers}
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
                REFRESH REGISTER
            </button>
        </div>
    );
}

function getTierColor(tier: string) {
    switch (tier) {
        case 'GOLD': return '#ffd700';
        case 'SILVER': return '#c0c0c0';
        case 'BRONZE': return '#cd7f32';
        default: return 'var(--neon-green)';
    }
}
