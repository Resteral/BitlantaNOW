-- Fix RLS policies to allow market data simulation

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow public read access to market_assets" ON market_assets;
DROP POLICY IF EXISTS "Allow public read access to price_history" ON price_history;
DROP POLICY IF EXISTS "Allow public read access to market_updates" ON market_updates;

-- Create more permissive policies for market data operations
CREATE POLICY "Allow all operations on market_assets" ON market_assets FOR ALL USING (true);
CREATE POLICY "Allow all operations on price_history" ON price_history FOR ALL USING (true);
CREATE POLICY "Allow all operations on market_updates" ON market_updates FOR ALL USING (true);

-- Update the simulate_market_data function to use SECURITY DEFINER
-- This allows the function to run with elevated privileges
CREATE OR REPLACE FUNCTION simulate_market_data()
RETURNS void 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  asset_record RECORD;
  price_change DECIMAL;
  volume_change DECIMAL;
  update_message TEXT;
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
    
    -- Add price history entry
    INSERT INTO price_history (asset_id, price, volume)
    VALUES (asset_record.id, asset_record.current_price * (1 + price_change), asset_record.volume_24h * (1 + volume_change));
    
    -- Generate market update if significant price change
    IF ABS(price_change * 100) > 1.5 THEN
      update_message := CASE 
        WHEN price_change > 0 THEN asset_record.symbol || ' surged ' || ROUND(ABS(price_change * 100), 2) || '% to $' || ROUND(asset_record.current_price * (1 + price_change), 2)
        ELSE asset_record.symbol || ' dropped ' || ROUND(ABS(price_change * 100), 2) || '% to $' || ROUND(asset_record.current_price * (1 + price_change), 2)
      END;
      
      INSERT INTO market_updates (symbol, type, message, change_percent)
      VALUES (asset_record.symbol, 'price', update_message, price_change * 100);
    END IF;
  END LOOP;
  
  -- Clean up old price history (keep last 100 records per asset)
  DELETE FROM price_history 
  WHERE id NOT IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY asset_id ORDER BY timestamp DESC) as rn
      FROM price_history
    ) t WHERE t.rn <= 100
  );
  
  -- Clean up old market updates (keep last 50 records)
  DELETE FROM market_updates 
  WHERE id NOT IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
      FROM market_updates
    ) t WHERE t.rn <= 50
  );
END;
$$ LANGUAGE plpgsql;

-- Update the update_price_history function to use SECURITY DEFINER as well
CREATE OR REPLACE FUNCTION update_price_history()
RETURNS void 
SECURITY DEFINER
SET search_path = public
AS $$
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
