'use client';

import React from 'react';
import { useMarketData } from '@/lib/hooks/useMarketData';

export default function MarketTicker() {
    const { data, loading, error } = useMarketData();

    if (error) return null;

    // Mock LANT data
    const lantPrice = 0.0042 + (Math.random() * 0.0001);
    const lantChange = 1.25 + (Math.random() * 0.5);

    const tickerItems = loading ? [] : [
        { symbol: 'LANT', priceUsd: lantPrice.toFixed(4), priceChange: { h24: lantChange } },
        ...data
    ];

    return (
        <div style={{
            width: '100%',
            background: 'rgba(5, 2, 20, 0.4)',
            backdropFilter: 'blur(30px)',
            borderBottom: '1px solid rgba(255, 113, 206, 0.1)',
            padding: '1rem 0',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            position: 'relative',
            zIndex: 100
        }}>
            <div className="ticker-scroll" style={{
                display: 'inline-flex',
                animation: 'scroll 60s linear infinite',
            }}>
                {loading ? (
                    <span style={{ color: 'var(--vw-cyan)', padding: '0 2rem', letterSpacing: '4px', fontSize: '0.7rem', fontWeight: 300, fontStyle: 'italic' }}>
                        WAKING UP DIGITAL PARADISE...
                    </span>
                ) : (
                    // Render multiple times for seamless loop
                    [...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((token, i) => (
                        <div key={`${token.symbol}-${i}`} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0 4rem',
                            gap: '1.2rem',
                            borderRight: '1px solid rgba(255, 255, 255, 0.03)'
                        }}>
                            <span style={{
                                fontWeight: 300,
                                color: token.symbol === 'LANT' ? 'var(--vw-magenta)' : '#fff',
                                textShadow: token.symbol === 'LANT' ? '0 0 15px var(--vw-magenta)' : 'none',
                                fontSize: '0.85rem',
                                letterSpacing: '2px',
                                fontStyle: 'italic'
                            }}>{token.symbol}</span>
                            <span style={{
                                color: 'var(--vw-cyan)',
                                fontSize: '1rem',
                                fontWeight: 300,
                                letterSpacing: '1px'
                            }}>${Number(token.priceUsd).toLocaleString(undefined, { maximumFractionDigits: (Number(token.priceUsd) < 0.1 ? 6 : 2) })}</span>
                            <span style={{
                                color: token.priceChange.h24 >= 0 ? 'var(--vw-blue)' : 'var(--vw-magenta)',
                                fontSize: '0.65rem',
                                fontWeight: 900,
                                letterSpacing: '1px',
                                background: token.priceChange.h24 >= 0 ? 'rgba(5, 255, 161, 0.1)' : 'rgba(255, 113, 206, 0.1)',
                                border: `1px solid ${token.priceChange.h24 >= 0 ? 'var(--vw-blue)44' : 'var(--vw-magenta)44'}`,
                                padding: '2px 8px',
                                borderRadius: '100px'
                            }}>
                                {token.priceChange.h24 >= 0 ? '↗' : '↘'} {Math.abs(token.priceChange.h24).toFixed(2)}%
                            </span>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .ticker-scroll {
          will-change: transform;
        }
      `}</style>
        </div>
    );
}
