'use client';
import { useEffect, useState } from 'react';

export default function CryptoBanner() {
  const [prices, setPrices] = useState<{ [key: string]: number } | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd'
        );

        if (!response.ok) throw new Error('API limit or error');

        const data = await response.json();

        setPrices({
          'BTC': data.bitcoin.usd,
          'SOL': data.solana.usd,
          'ETH': data.ethereum.usd,
          'LANT': 0.0042 + (Math.random() * 0.0001) // Keeping the "Lost City" token
        });
      } catch (error) {
        console.warn('Using fallback data due to API error:', error);
        // Fallback to mock data if API fails
        setPrices(prev => prev || {
          'BTC': 96500 + Math.random() * 100,
          'SOL': 148 + Math.random() * 2,
          'ETH': 3600 + Math.random() * 10,
          'LANT': 0.0042
        });
      }
    };

    fetchPrices();
    // Fetch every 30 seconds to avoid hitting rate limits (CoinGecko free tier is ~30req/min)
    const interval = setInterval(fetchPrices, 30000);
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
