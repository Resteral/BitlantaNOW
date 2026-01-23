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
}

export default function SignalFeed() {
    const [signals, setSignals] = useState<Signal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSignals = async () => {
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

        fetchSignals();

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

    if (loading) return <div style={{ color: 'var(--foreground)', textAlign: 'center' }}>Scanning frequencies...</div>;

    if (signals.length === 0) return (
        <div style={{
            color: 'var(--foreground)',
            textAlign: 'center',
            border: '1px dashed var(--foreground)',
            padding: '2rem',
            opacity: 0.7
        }}>
            NO ACTIVE TRANSMISSIONS FOUND
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
                <SignalCard key={signal.id} signal={signal} />
            ))}
        </div>
    );
}
