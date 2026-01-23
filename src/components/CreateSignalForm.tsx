'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CreateSignalForm() {
    const [pair, setPair] = useState('');
    const [type, setType] = useState<'LONG' | 'SHORT'>('LONG');
    const [entry, setEntry] = useState('');
    const [target, setTarget] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    const [tier, setTier] = useState<'FREE' | 'BRONZE' | 'SILVER' | 'GOLD'>('FREE');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const { error } = await supabase.from('signals').insert([
                {
                    pair: pair.toUpperCase(),
                    type,
                    entry_price: parseFloat(entry),
                    target_price: target ? parseFloat(target) : null,
                    stop_loss: stopLoss ? parseFloat(stopLoss) : null,
                    tier,
                    status: 'ACTIVE'
                }
            ]);

            if (error) throw error;

            setMessage('Signal transmitted successfully.');
            setPair('');
            setEntry('');
            setTarget('');
            setStopLoss('');
        } catch (error: any) {
            setMessage('Transmission failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>PAIR</label>
                <input
                    type="text"
                    value={pair}
                    onChange={(e) => setPair(e.target.value)}
                    placeholder="BTC/USD"
                    required
                    style={inputStyle}
                />
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>TYPE</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => setType('LONG')}
                        style={{
                            ...typeButtonStyle,
                            background: type === 'LONG' ? 'var(--gold)' : 'transparent',
                            color: type === 'LONG' ? 'black' : 'var(--gold)'
                        }}
                    >
                        LONG
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('SHORT')}
                        style={{
                            ...typeButtonStyle,
                            background: type === 'SHORT' ? 'var(--gold)' : 'transparent',
                            color: type === 'SHORT' ? 'black' : 'var(--gold)'
                        }}
                    >
                        SHORT
                    </button>
                </div>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>ENTRY PRICE</label>
                <input
                    type="number"
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="0.00"
                    required
                    step="any"
                    style={inputStyle}
                />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>TARGET</label>
                    <input
                        type="number"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="0.00"
                        step="any"
                        style={inputStyle}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>STOP LOSS</label>
                    <input
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        placeholder="0.00"
                        step="any"
                        style={inputStyle}
                    />
                </div>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>ACCESS TIER</label>
                <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as any)}
                    style={inputStyle}
                >
                    <option value="FREE">FREE (ALL USERS)</option>
                    <option value="BRONZE">BRONZE</option>
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={loading}
                style={{
                    padding: '1rem',
                    marginTop: '1rem',
                    background: 'var(--foreground)',
                    color: 'var(--background)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    opacity: loading ? 0.7 : 1
                }}
            >
                {loading ? 'TRANSMITTING...' : 'INITIALIZE SIGNAL'}
            </button>

            {message && <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: message.includes('failed') ? 'red' : 'var(--gold)' }}>{message}</p>}
        </form>
    );
}

const inputStyle = {
    width: '100%',
    padding: '0.8rem',
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid var(--foreground)',
    color: 'var(--foreground)',
    fontFamily: 'inherit'
};

const typeButtonStyle = {
    flex: 1,
    padding: '0.5rem',
    border: '1px solid var(--gold)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 'bold' as 'bold',
    transition: 'all 0.3s ease'
};
