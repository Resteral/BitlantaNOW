-- Add missing cryptocurrency assets that CoinGecko provides but aren't in the database
INSERT INTO market_assets (symbol, name, current_price, change_24h, volume_24h, market_cap) VALUES
('XRP', 'Ripple', 0.5234, 1.45, 1200000000, 29000000000),
('BNB', 'Binance Coin', 245.67, -0.89, 890000000, 37000000000),
('DOGE', 'Dogecoin', 0.0789, 3.21, 560000000, 11500000000),
('AVAX', 'Avalanche', 28.45, 2.67, 340000000, 11200000000)
ON CONFLICT (symbol) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  change_24h = EXCLUDED.change_24h,
  volume_24h = EXCLUDED.volume_24h,
  market_cap = EXCLUDED.market_cap,
  last_updated = NOW();
