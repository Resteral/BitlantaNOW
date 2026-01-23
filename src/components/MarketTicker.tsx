'use client';

import React from 'react';
import { useMarketData } from '@/lib/hooks/useMarketData';

export default function MarketTicker() {
    const { data, loading, error } = useMarketData();

    if (error) return null; // Silence errors for now or show a subtle message

    return (
        <div style={{
            width: '100%',
            background: 'rgba(5, 2, 20, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(57, 255, 20, 0.2)',
            padding: '0.5rem 0',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            position: 'relative',
            zIndex: 100
        }}>
            <div className="ticker-scroll" style={{
                display: 'inline-flex',
                animation: 'scroll 30s linear infinite',
            }}>
                {loading ? (
                    <span style={{ color: 'var(--neon-green)', padding: '0 2rem' }}>INITIALIZING DATA STREAM...</span>
                ) : (
                    // Render twice for seamless loop
                    [...data, ...data].map((token, i) => (
                        <div key={`${token.symbol}-${i}`} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0 2rem',
                            gap: '0.8rem'
                        }}>
                            <span style={{ fontWeight: 800, color: '#fff' }}>{token.symbol}</span>
                            <span style={{ color: 'var(--neon-green)' }}>${Number(token.priceUsd).toLocaleString(undefined, { maximumFractionDigits: (Number(token.priceUsd) < 0.1 ? 6 : 2) })}</span>
                            <span style={{
                                color: token.priceChange.h24 >= 0 ? 'var(--neon-green)' : '#ff4b4b',
                                fontSize: '0.8rem'
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
          100% { transform: translateX(-50%); }
        }
        .ticker-scroll {
          will-change: transform;
        }
      `}</style>
        </div>
    );
}
