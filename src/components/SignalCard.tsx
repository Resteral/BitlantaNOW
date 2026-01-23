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
    const statusColor = isLong ? 'var(--neon-green)' : '#ff4d4d'; // Green for Long, Red for Short
    const glowColor = isLong ? 'var(--glow-green)' : 'rgba(255, 77, 77, 0.4)';

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            padding: '2rem 1.5rem 1.5rem',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderBottom: `4px solid ${statusColor}`,
            borderRadius: '16px', // Modern card shape (user might prefer Arch, but standard cards are safer for content. Will add decorative arch inside)
            boxShadow: `0 10px 30px -10px ${glowColor}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}>
            {/* Decorative Arch "Gate" Background Effect */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '50%',
                transform: 'translate(-50%, 0)',
                width: '120%',
                height: '100%',
                background: `radial-gradient(circle at 50% 100%, ${glowColor} 0%, transparent 50%)`,
                opacity: 0.2,
                pointerEvents: 'none',
                zIndex: 0
            }} />

            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 1,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                paddingBottom: '1rem'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#fff',
                    letterSpacing: '-0.02em'
                }}>
                    {signal.pair}
                </h3>
                <span style={{
                    background: statusColor,
                    color: '#000',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    fontWeight: '800',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    boxShadow: `0 0 10px ${glowColor}`
                }}>
                    {signal.type}
                </span>
            </div>

            {/* Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                fontSize: '0.9rem',
                zIndex: 1
            }}>
                <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Entry</span>
                    <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', color: '#fff' }}>${signal.entry_price}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Target</span>
                    <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', color: 'var(--neon-green)' }}>
                        ${signal.target_price || '---'}
                    </div>
                </div>
            </div>

            {/* Status Footer */}
            <div style={{
                marginTop: 'auto',
                paddingTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
                zIndex: 1
            }}>
                <span>ID: {signal.id.slice(0, 4)}...</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: signal.status === 'ACTIVE' ? 'var(--neon-green)' : '#555',
                        boxShadow: signal.status === 'ACTIVE' ? `0 0 5px var(--neon-green)` : 'none'
                    }} />
                    {signal.status}
                </div>
            </div>
        </div>
    );
}
