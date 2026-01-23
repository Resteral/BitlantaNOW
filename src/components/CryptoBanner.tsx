'use client';
import { useEffect, useState } from 'react';

export default function CryptoBanner() {
    const [prices, setPrices] = useState<{ [key: string]: number } | null>(null);

    useEffect(() => {
        // Mock prices or fetch from API
        // Ideally fetch from GeckoTerminal or CoinGecko
        const fetchPrices = () => {
            setPrices({
                'BTC': 95000 + Math.random() * 1000,
                'SOL': 145 + Math.random() * 5,
                'ETH': 3500 + Math.random() * 50,
                'LANT': 0.0042 // Made up token
            });
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 5000);
        return () => clearInterval(interval);
    }, []);

    if (!prices) return <div className="banner-loading">LOADING DATA STREAM...</div>;

    return (
        <div className="crypto-banner">
            <div className="ticker-wrap">
                <div className="ticker">
                    {Object.entries(prices).map(([symbol, price]) => (
                        <span key={symbol} className="ticker-item">
                            {symbol}: <span className="price">${price.toFixed(symbol === 'LANT' ? 4 : 2)}</span>
                        </span>
                    ))}
                    {/* Duplicate for smooth scroll */}
                    {Object.entries(prices).map(([symbol, price]) => (
                        <span key={`${symbol}-dup`} className="ticker-item">
                            {symbol}: <span className="price">${price.toFixed(symbol === 'LANT' ? 4 : 2)}</span>
                        </span>
                    ))}
                </div>
            </div>
            <style jsx>{`
        .crypto-banner {
          width: 100%;
          background: #000;
          border-bottom: 1px solid var(--foreground);
          overflow: hidden;
          padding: 10px 0;
          font-family: var(--font-retro);
          font-size: 0.8rem;
          color: var(--foreground);
        }
        .ticker-wrap {
          width: 100%;
          overflow: hidden;
        }
        .ticker {
          display: inline-block;
          white-space: nowrap;
          animation: ticker 20s linear infinite;
        }
        .ticker-item {
          display: inline-block;
          padding: 0 2rem;
        }
        .price {
          color: var(--gold);
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </div>
    );
}
