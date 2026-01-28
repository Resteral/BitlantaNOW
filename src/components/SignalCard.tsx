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
    tier: 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD';
}

const TIER_RANK = {
    'FREE': 0,
    'BRONZE': 1,
    'SILVER': 2,
    'GOLD': 3
};

export default function SignalCard({ signal, userTier = 'FREE' }: { signal: Signal; userTier?: string }) {
    const isLocked = TIER_RANK[signal.tier as keyof typeof TIER_RANK] > TIER_RANK[userTier as keyof typeof TIER_RANK];
    const isLong = signal.type === 'LONG';
    const statusColor = isLong ? 'var(--vw-cyan)' : 'var(--vw-magenta)';
    const glowColor = isLong ? 'var(--glow-cyan)' : 'var(--glow-pink)';

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            padding: '2.5rem 2rem 2rem',
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderTop: `2px solid ${statusColor}`,
            borderRadius: '24px',
            boxShadow: `0 20px 40px -20px ${glowColor}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
            {/* Soft Ambient Glow */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '140%',
                height: '80%',
                background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 70%)`,
                opacity: 0.15,
                pointerEvents: 'none',
                zIndex: 0
            }} />

            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                zIndex: 1,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                paddingBottom: '1.5rem'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '2rem',
                    fontWeight: 300,
                    color: '#fff',
                    letterSpacing: '-0.03em',
                    fontStyle: 'italic'
                }}>
                    {signal.pair}
                </h3>
                <span style={{
                    color: statusColor,
                    padding: '0.4rem 1rem',
                    borderRadius: '100px',
                    fontWeight: '900',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    border: `1px solid ${statusColor}`,
                    background: `${statusColor}11`,
                    boxShadow: `0 0 15px ${statusColor}44`
                }}>
                    {signal.type}
                </span>
            </div>

            {/* Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                fontSize: '0.9rem',
                zIndex: 1,
                filter: isLocked ? 'blur(10px)' : 'none',
                opacity: isLocked ? 0.2 : 1,
                transition: 'all 0.5s ease'
            }}>
                <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>Entry</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 300, color: '#fff', marginTop: '0.5rem' }}>${signal.entry_price}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>Target</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 300, color: 'var(--vw-cyan)', marginTop: '0.5rem', textShadow: '0 0 10px rgba(1, 205, 254, 0.3)' }}>
                        ${signal.target_price || '---'}
                    </div>
                </div>
            </div>

            {/* Lock Overlay */}
            {isLocked && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    background: 'rgba(5, 2, 20, 0.6)',
                    padding: '2rem'
                }}>
                    <div style={{
                        fontSize: '2.5rem',
                        marginBottom: '1rem',
                        filter: 'drop-shadow(0 0 15px var(--vw-magenta))'
                    }}>💎</div>
                    <div style={{
                        color: 'var(--vw-magenta)',
                        fontWeight: 300,
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '4px',
                        textAlign: 'center',
                        fontStyle: 'italic'
                    }}>
                        Exclusive {signal.tier} Transmission
                    </div>
                </div>
            )}

            {/* Status Footer */}
            <div style={{
                marginTop: 'auto',
                paddingTop: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.7rem',
                color: 'var(--text-dim)',
                zIndex: 1,
                letterSpacing: '1px'
            }}>
                <span style={{ opacity: 0.4 }}>SIG_{signal.id.slice(0, 8).toUpperCase()}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: signal.status === 'ACTIVE' ? 'var(--vw-blue)' : '#333',
                        boxShadow: signal.status === 'ACTIVE' ? `0 0 10px var(--vw-blue)` : 'none'
                    }} />
                    {signal.status}
                </div>
            </div>
        </div>
    );
}
