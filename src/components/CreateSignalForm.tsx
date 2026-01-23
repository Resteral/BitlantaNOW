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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', color: '#fff' }}>PAIR</label>
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
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', color: '#fff' }}>TYPE</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => setType('LONG')}
                        style={{
                            ...typeButtonStyle,
                            background: type === 'LONG' ? 'var(--vw-cyan)' : 'transparent',
                            color: type === 'LONG' ? '#000' : 'var(--vw-cyan)',
                            borderColor: 'var(--vw-cyan)'
                        }}
                    >
                        LONG
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('SHORT')}
                        style={{
                            ...typeButtonStyle,
                            background: type === 'SHORT' ? 'var(--vw-magenta)' : 'transparent',
                            color: type === 'SHORT' ? '#000' : 'var(--vw-magenta)',
                            borderColor: 'var(--vw-magenta)'
                        }}
                    >
                        SHORT
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', color: '#fff' }}>ENTRY</label>
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
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', color: '#fff' }}>TIER</label>
                    <select
                        value={tier}
                        onChange={(e) => setTier(e.target.value as any)}
                        style={inputStyle}
                    >
                        <option value="FREE">FREE</option>
                        <option value="BRONZE">BRONZE</option>
                        <option value="SILVER">SILVER</option>
                        <option value="GOLD">GOLD</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', color: '#fff' }}>TARGET</label>
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
                    <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', color: '#fff' }}>STOP LOSS</label>
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

            <button
                type="submit"
                disabled={loading}
                className="vapor-btn-submit"
                style={{
                    padding: '1.2rem',
                    marginTop: '1rem',
                    background: 'linear-gradient(45deg, var(--vw-magenta), var(--vw-cyan))',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '900',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    borderRadius: '16px',
                    boxShadow: '0 10px 20px rgba(255, 113, 206, 0.3)',
                    transition: 'all 0.4s ease',
                    opacity: loading ? 0.7 : 1
                }}
            >
                {loading ? 'TRANSMITTING...' : 'INITIATE BROADCAST'}
            </button>

            {message && (
                <p style={{
                    fontSize: '0.75rem',
                    marginTop: '1rem',
                    color: message.includes('failed') ? 'var(--vw-magenta)' : 'var(--vw-cyan)',
                    textAlign: 'center',
                    fontStyle: 'italic',
                    letterSpacing: '1px'
                }}>
                    {message.toUpperCase()}
                </p>
            )}

            <style jsx>{`
                .vapor-btn-submit:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px rgba(255, 113, 206, 0.5);
                    letter-spacing: 6px;
                }
            `}</style>
        </form>
    );
}

const inputStyle = {
    width: '100%',
    padding: '0.9rem',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontFamily: 'inherit',
    borderRadius: '12px',
    outline: 'none',
    fontSize: '0.9rem'
};

const typeButtonStyle = {
    flex: 1,
    padding: '0.8rem',
    border: '1px solid',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: '900' as const,
    borderRadius: '100px',
    letterSpacing: '2px',
    fontSize: '0.7rem',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
};
