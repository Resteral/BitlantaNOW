-- PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  wallet_balance numeric default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles
  for select using ( auth.uid() = id );

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
  for update using ( auth.uid() = id );

drop policy if exists "Public profiles access" on public.profiles;
create policy "Public profiles access" on public.profiles
    for select using (true);

-- MARKET ASSETS TABLE
create table if not exists public.market_assets (
  id uuid default uuid_generate_v4() primary key,
  symbol text not null unique,
  name text not null,
  current_price numeric not null,
  change_24h numeric default 0,
  volume_24h numeric default 0,
  market_cap numeric default 0,
  is_active boolean default true,
  last_updated timestamp with time zone default now()
);
alter table public.market_assets enable row level security;

drop policy if exists "Everyone can view market assets" on public.market_assets;
create policy "Everyone can view market assets" on public.market_assets
  for select using ( true );

-- PRICE HISTORY TABLE
create table if not exists public.price_history (
  id uuid default uuid_generate_v4() primary key,
  asset_id uuid references public.market_assets(id) on delete cascade,
  price numeric not null,
  volume numeric default 0,
  timestamp timestamp with time zone default now()
);
alter table public.price_history enable row level security;

drop policy if exists "Everyone can view price history" on public.price_history;
create policy "Everyone can view price history" on public.price_history
  for select using ( true );

-- MARKET UPDATES TABLE
create table if not exists public.market_updates (
  id uuid default uuid_generate_v4() primary key,
  symbol text not null,
  type text check (type in ('price', 'volume', 'news', 'alert')),
  message text not null,
  change_percent numeric,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);
alter table public.market_updates enable row level security;

drop policy if exists "Everyone can view market updates" on public.market_updates;
create policy "Everyone can view market updates" on public.market_updates
  for select using ( true );

-- SUBSCRIPTIONS TABLE
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  plan_id text not null,
  plan_name text not null,
  price numeric not null,
  currency text default 'RETRO',
  status text default 'active',
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone
);
alter table public.subscriptions enable row level security;

drop policy if exists "Users can view own subscriptions" on public.subscriptions;
create policy "Users can view own subscriptions" on public.subscriptions
  for select using ( auth.uid() = user_id );

-- TRANSACTIONS TABLE
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  type text not null check (type in ('send', 'receive', 'subscription', 'purchase')),
  amount numeric not null,
  currency text not null,
  description text,
  status text default 'pending',
  subscription_id uuid references public.subscriptions(id),
  created_at timestamp with time zone default now()
);
alter table public.transactions enable row level security;

drop policy if exists "Users can view own transactions" on public.transactions;
create policy "Users can view own transactions" on public.transactions
  for select using ( auth.uid() = user_id );

-- Insert trigger to create profile on signup (optional)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profiles for existing users
insert into public.profiles (id, display_name)
select id, split_part(email, '@', 1)
from auth.users
where id not in (select id from public.profiles);
