'use client';

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

export default function SignalCard({ signal }: { signal: Signal }) {
    const isLong = signal.type === 'LONG';
    const profit = signal.target_price ? ((signal.target_price - signal.entry_price) / signal.entry_price * 100).toFixed(2) : '---';

    return (
        <div style={{
            border: `1px solid ${isLong ? 'var(--teal)' : 'var(--orange)'}`,
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 0 10px ${isLong ? 'rgba(0, 255, 255, 0.2)' : 'rgba(255, 100, 0, 0.2)'}`
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--foreground)',
                paddingBottom: '0.5rem'
            }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--foreground)' }}>{signal.pair}</h3>
                <span style={{
                    background: isLong ? 'var(--teal)' : 'var(--orange)',
                    color: '#000',
                    padding: '0.2rem 0.5rem',
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                }}>
                    {signal.type}
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                <div>
                    <span style={{ opacity: 0.7 }}>ENTRY:</span>
                    <div style={{ fontSize: '1.1rem' }}>${signal.entry_price}</div>
                </div>
                <div>
                    <span style={{ opacity: 0.7 }}>TARGET:</span>
                    <div style={{ fontSize: '1.1rem', color: 'var(--gold)' }}>
                        ${signal.target_price || '---'}
                    </div>
                </div>
                <div>
                    <span style={{ opacity: 0.7 }}>STOP LOSS:</span>
                    <div style={{ fontSize: '1.1rem', color: 'red' }}>
                        ${signal.stop_loss || '---'}
                    </div>
                </div>
                <div>
                    <span style={{ opacity: 0.7 }}>POTENTIAL:</span>
                    <div style={{ fontSize: '1.1rem', color: isLong ? 'var(--teal)' : 'var(--orange)' }}>
                        {profit}%
                    </div>
                </div>
            </div>

            <div style={{
                marginTop: '1rem',
                fontSize: '0.7rem',
                opacity: 0.5,
                textAlign: 'right'
            }}>
                ID: {signal.id.slice(0, 8)} // {new Date(signal.created_at).toLocaleDateString()}
            </div>
        </div>
    );
}
