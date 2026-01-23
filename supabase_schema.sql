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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  closed_at timestamp with time zone
);

-- Enable RLS for signals
alter table public.signals enable row level security;

-- Policies for signals
-- Everyone can view signals
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
