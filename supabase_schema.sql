-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- SIGNALS TABLE
create table if not exists public.signals (
  id uuid default uuid_generate_v4() primary key,
  pair text not null,
  type text not null check (type in ('LONG', 'SHORT')),
  entry_price numeric not null,
  target_price numeric,
  stop_loss numeric,
  status text default 'ACTIVE' check (status in ('ACTIVE', 'CLOSED', 'CANCELED')),
  tier text default 'FREE' check (tier in ('FREE', 'BRONZE', 'SILVER', 'GOLD')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  closed_at timestamp with time zone
);

-- Enable RLS for signals
alter table public.signals enable row level security;

-- Policies for signals
-- Everyone can view signals (we will filter in the app for now)
create policy "Public signals are viewable by everyone"
  on public.signals for select
  using ( true );

-- Only authenticated users (admins) can insert/update/delete
create policy "Admins can insert signals"
  on public.signals for insert
  with check ( auth.role() = 'authenticated' );

create policy "Admins can update signals"
  on public.signals for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can delete signals"
  on public.signals for delete
  using ( auth.role() = 'authenticated' );

-- USER TIERS TABLE
create table if not exists public.user_tiers (
  id uuid references auth.users on delete cascade primary key,
  tier text default 'FREE' check (tier in ('FREE', 'BRONZE', 'SILVER', 'GOLD')),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for user_tiers
alter table public.user_tiers enable row level security;

-- Policies for user_tiers
create policy "Users can view their own tier"
  on public.user_tiers for select
  using ( auth.uid() = id );

create policy "Admins can view all user tiers"
  on public.user_tiers for select
  using ( auth.role() = 'authenticated' );

-- BOT TRADES TABLE
create table if not exists public.trades (
  id uuid default uuid_generate_v4() primary key,
  pair text not null,
  type text not null check (type in ('BUY', 'SELL')),
  price numeric not null,
  amount numeric not null,
  total_val numeric not null,
  tx_hash text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for trades
alter table public.trades enable row level security;

-- Policies for trades
create policy "Admins can view all trades"
  on public.trades for select
  using ( auth.role() = 'authenticated' );

-- BOT SETTINGS TABLE
create table if not exists public.bot_settings (
  id uuid default uuid_generate_v4() primary key,
  is_active boolean default false,
  default_trade_amount numeric default 100,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for bot_settings
alter table public.bot_settings enable row level security;

-- Policies for bot_settings
-- Only authenticated users (admins) can view/edit
create policy "Admins can view bot settings"
  on public.bot_settings for select
  using ( auth.role() = 'authenticated' );

create policy "Admins can update bot settings"
  on public.bot_settings for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can insert bot settings"
  on public.bot_settings for insert
  with check ( auth.role() = 'authenticated' );

-- Insert default settings row if not exists
insert into public.bot_settings (is_active, default_trade_amount)
select false, 100
where not exists (select 1 from public.bot_settings);
