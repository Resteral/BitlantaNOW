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
            background: 'rgba(5, 2, 20, 0.9)',
            backdropFilter: 'blur(15px)',
            borderBottom: '1px solid rgba(188, 19, 254, 0.3)',
            padding: '0.75rem 0',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            position: 'relative',
            zIndex: 100,
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
        }}>
            <div className="ticker-scroll" style={{
                display: 'inline-flex',
                animation: 'scroll 40s linear infinite',
            }}>
                {loading ? (
                    <span style={{ color: 'var(--neon-green)', padding: '0 2rem', letterSpacing: '2px', fontSize: '0.8rem' }}>
                        AUTHENTICATING MARKET DATA STREAMS...
                    </span>
                ) : (
                    // Render multiple times for seamless loop
                    [...tickerItems, ...tickerItems, ...tickerItems].map((token, i) => (
                        <div key={`${token.symbol}-${i}`} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0 3rem',
                            gap: '1rem',
                            borderRight: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                            <span style={{
                                fontWeight: 900,
                                color: token.symbol === 'LANT' ? 'var(--neon-purple)' : '#fff',
                                textShadow: token.symbol === 'LANT' ? '0 0 10px var(--neon-purple)' : 'none',
                                fontSize: '0.9rem'
                            }}>{token.symbol}</span>
                            <span style={{
                                color: 'var(--neon-green)',
                                fontFamily: 'monospace',
                                fontSize: '1rem',
                                fontWeight: 700
                            }}>${Number(token.priceUsd).toLocaleString(undefined, { maximumFractionDigits: (Number(token.priceUsd) < 0.1 ? 6 : 2) })}</span>
                            <span style={{
                                color: token.priceChange.h24 >= 0 ? 'var(--neon-green)' : '#ff4b4b',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: 'rgba(255, 255, 255, 0.03)',
                                padding: '2px 6px',
                                borderRadius: '4px'
                            }}>
                                {token.priceChange.h24 >= 0 ? '▲' : '▼'} {Math.abs(token.priceChange.h24).toFixed(2)}%
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
