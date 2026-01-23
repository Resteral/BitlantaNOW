'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import SignalCard from './SignalCard';

interface Signal {
    id: string;
    pair: string;
    type: 'LONG' | 'SHORT';
    entry_price: number;
    target_price?: number;
    stop_loss?: number;
    created_at: string;
    status: 'ACTIVE' | 'CLOSED' | 'CANCELED';
    tier: 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD';
}

export default function SignalFeed() {
    const [signals, setSignals] = useState<Signal[]>([]);
    const [userTier, setUserTier] = useState<string>('FREE');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Fetch User Tier if logged in
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: tierData } = await supabase
                    .from('user_tiers')
                    .select('tier')
                    .eq('id', user.id)
                    .single();
                if (tierData) setUserTier(tierData.tier);
            }

            // Fetch Signals
            const { data, error } = await supabase
                .from('signals')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (!error && data) {
                setSignals(data as Signal[]);
            }
            setLoading(false);
        };

        fetchData();

        // Optional: Subscribe to realtime changes
        const channel = supabase
            .channel('public:signals')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'signals' }, (payload) => {
                setSignals(prev => [payload.new as Signal, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (loading) return (
        <div style={{
            color: 'var(--neon-green)',
            textAlign: 'center',
            padding: '2rem',
            letterSpacing: '0.2em',
            animation: 'pulse 1.5s infinite'
        }}>
            SCANNING FREQUENCIES...
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; text-shadow: 0 0 10px var(--neon-green); }
                }
            `}</style>
        </div>
    );

    if (signals.length === 0) return (
        <div style={{
            color: 'var(--text-dim)',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '3rem',
            borderRadius: '16px',
            backdropFilter: 'blur(5px)'
        }}>
            NO ACTIVE GATES DETECTED
        </div>
    );

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            padding: '1rem 0'
        }}>
            {signals.map(signal => (
                <SignalCard key={signal.id} signal={signal} userTier={userTier} />
            ))}
        </div>
    );
}
