-- Create market data tables for real-time crypto tracking
CREATE TABLE IF NOT EXISTS market_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  current_price DECIMAL(20, 8) NOT NULL,
  change_24h DECIMAL(10, 4) NOT NULL,
  volume_24h DECIMAL(20, 2) NOT NULL,
  market_cap DECIMAL(20, 2),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create price history table for charts
CREATE TABLE IF NOT EXISTS price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES market_assets(id) ON DELETE CASCADE,
  price DECIMAL(20, 8) NOT NULL,
  volume DECIMAL(20, 2) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create market updates/news feed
CREATE TABLE IF NOT EXISTS market_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('price', 'volume', 'news', 'alert')),
  message TEXT NOT NULL,
  change_percent DECIMAL(10, 4),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial market assets
INSERT INTO market_assets (symbol, name, current_price, change_24h, volume_24h, market_cap) VALUES
('BTC', 'Bitcoin', 67234.50, 2.34, 28500000000, 1320000000000),
('ETH', 'Ethereum', 3456.78, -1.23, 15200000000, 415000000000),
('ADA', 'Cardano', 0.4567, 5.67, 890000000, 16200000000),
('SOL', 'Solana', 156.89, 3.45, 2100000000, 71000000000),
('DOT', 'Polkadot', 7.23, -2.11, 340000000, 9800000000),
('MATIC', 'Polygon', 0.8934, 4.56, 450000000, 8900000000)
ON CONFLICT (symbol) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  change_24h = EXCLUDED.change_24h,
  volume_24h = EXCLUDED.volume_24h,
  market_cap = EXCLUDED.market_cap,
  last_updated = NOW();

-- Enable Row Level Security
ALTER TABLE market_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_updates ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to market_assets" ON market_assets FOR SELECT USING (true);
CREATE POLICY "Allow public read access to price_history" ON price_history FOR SELECT USING (true);
CREATE POLICY "Allow public read access to market_updates" ON market_updates FOR SELECT USING (true);

-- Create function to update price history
CREATE OR REPLACE FUNCTION update_price_history()
RETURNS void AS $$
BEGIN
  -- Insert current prices into price history
  INSERT INTO price_history (asset_id, price, volume)
  SELECT id, current_price, volume_24h FROM market_assets WHERE is_active = true;
  
  -- Clean up old price history (keep last 100 records per asset)
  DELETE FROM price_history 
  WHERE id NOT IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY asset_id ORDER BY timestamp DESC) as rn
      FROM price_history
    ) t WHERE t.rn <= 100
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to simulate market updates
CREATE OR REPLACE FUNCTION simulate_market_data()
RETURNS void AS $$
DECLARE
  asset_record RECORD;
  price_change DECIMAL;
  volume_change DECIMAL;
BEGIN
  -- Update each asset with realistic price movements
  FOR asset_record IN SELECT * FROM market_assets WHERE is_active = true LOOP
    -- Calculate price change (smaller volatility for larger caps)
    price_change := (RANDOM() - 0.5) * CASE 
      WHEN asset_record.symbol IN ('BTC', 'ETH') THEN 0.02
      WHEN asset_record.symbol IN ('ADA', 'SOL') THEN 0.03
      ELSE 0.05
    END;
    
    -- Calculate volume change
    volume_change := (RANDOM() - 0.5) * 0.1;
    
    -- Update the asset
    UPDATE market_assets SET
      current_price = current_price * (1 + price_change),
      change_24h = change_24h + (price_change * 100),
      volume_24h = volume_24h * (1 + volume_change),
      last_updated = NOW()
    WHERE id = asset_record.id;
  END LOOP;
  
  -- Add price history entry
  PERFORM update_price_history();
END;
$$ LANGUAGE plpgsql;
