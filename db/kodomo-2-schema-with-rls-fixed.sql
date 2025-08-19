
-- Kodomo 2.0 — Initial Schema + RLS (Fixed Seed, No invalid UUIDs)
-- PostgreSQL / Supabase friendly. Safe to re-run.

create extension if not exists pgcrypto;

-- =========================
-- Enums (create if missing)
-- =========================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum ('pending','paid','preparing','ready','completed','canceled','refunded');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'order_channel') then
    create type order_channel as enum ('web','qr');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'order_fulfillment') then
    create type order_fulfillment as enum ('dine_in','takeout','delivery');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'wallet_type') then
    create type wallet_type as enum ('topup','purchase','refund','adjust','promo');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'coupon_type') then
    create type coupon_type as enum ('percent','fixed','gift');
  end if;
end $$;

-- =============
-- Core Entities
-- =============
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  phone text,
  role text check (role in ('member','cashier','kitchen','admin')) default 'member',
  created_at timestamptz default now()
);

create table if not exists members (
  id uuid primary key references users(id) on delete cascade,
  member_no text unique,
  name text,
  birthday date,
  marketing_opt_in boolean default false,
  created_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name_zh text not null,
  name_en text not null,
  sort_order int default 0,
  is_active boolean default true
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id),
  name_zh text not null,
  name_en text not null,
  desc_zh text default '',
  desc_en text default '',
  price_cents int not null,
  image_url text,
  is_active boolean default true,
  is_sold_out boolean default false,
  sku text,
  created_at timestamptz default now()
);

create unique index if not exists uq_products_sku on products(sku);

create table if not exists menus (
  id uuid primary key default gen_random_uuid(),
  title_zh text,
  title_en text,
  is_active boolean default true,
  valid_from date,
  valid_to date
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid references menus(id) on delete cascade,
  product_id uuid references products(id),
  price_override_cents int,
  is_recommended boolean default false
);

-- Dining tables for QR ordering
create table if not exists tables (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  qrcode_token text unique not null,
  location text
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  channel order_channel not null default 'web',
  table_id uuid references tables(id),
  member_id uuid references members(id),
  status order_status not null default 'pending',
  fulfillment order_fulfillment not null default 'dine_in',
  subtotal_cents int not null default 0,
  discount_cents int not null default 0,
  total_cents int not null default 0,
  currency text not null default 'JPY',
  notes text,
  created_at timestamptz default now(),
  paid_at timestamptz
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  qty int not null default 1,
  unit_price_cents int not null,
  options_json jsonb default '{}'::jsonb,
  line_total_cents int not null
);

-- ============
-- Wallet / CRM
-- ============
create table if not exists wallet_accounts (
  member_id uuid primary key references members(id) on delete cascade,
  balance_cents int not null default 0,
  currency text not null default 'JPY',
  updated_at timestamptz default now()
);

create table if not exists wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  type wallet_type not null,
  amount_cents int not null, -- positive or negative
  order_id uuid references orders(id),
  ref text,
  created_at timestamptz default now()
);

create table if not exists points_accounts (
  member_id uuid primary key references members(id) on delete cascade,
  points int not null default 0
);

create table if not exists points_ledger (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  delta_points int not null,
  reason text,
  order_id uuid references orders(id),
  created_at timestamptz default now()
);

create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title_zh text,
  title_en text,
  desc_zh text,
  desc_en text,
  type coupon_type not null,
  value int not null, -- percent or fixed cents
  min_spend_cents int default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  max_uses int,
  per_user_limit int default 1,
  is_active boolean default true
);

create table if not exists coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid references coupons(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  created_at timestamptz default now()
);

-- =========
-- Content
-- =========
create table if not exists news_posts (
  id uuid primary key default gen_random_uuid(),
  title_zh text,
  title_en text,
  body_zh text,
  body_en text,
  status text check (status in ('draft','published')) default 'draft',
  published_at timestamptz,
  cover_url text
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  subject text,
  message text,
  created_at timestamptz default now()
);

-- =========
-- Inventory
-- =========
create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  sku text unique,
  name text,
  track_stock boolean default false,
  stock_qty int default 0
);

create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid references inventory_items(id) on delete cascade,
  change int not null,
  reason text,
  order_id uuid references orders(id),
  created_at timestamptz default now()
);

-- =======
-- Indexes
-- =======
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_orders_member on orders(member_id);
create index if not exists idx_orders_created on orders(created_at);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_wallet_ledger_member_created on wallet_ledger(member_id, created_at);
create index if not exists idx_coupon_redemptions_coupon_member on coupon_redemptions(coupon_id, member_id);
create index if not exists idx_points_ledger_member_created on points_ledger(member_id, created_at);
create index if not exists idx_inventory_movements_item_created on inventory_movements(inventory_item_id, created_at);

-- ============
-- Seed samples (no hard-coded UUIDs)
-- ============
-- Categories: insert or ignore
insert into categories (name_zh, name_en, sort_order, is_active) values
  ('飯類','Rice',1,true),
  ('麵類','Noodles',2,true)
on conflict do nothing;

-- Products: reference categories by natural key (name_en)
with c_rice as (select id from categories where name_en='Rice' order by id limit 1),
     c_noodles as (select id from categories where name_en='Noodles' order by id limit 1)
insert into products (category_id, name_zh, name_en, desc_zh, desc_en, price_cents, is_active, is_sold_out, sku)
select c_rice.id, '招牌咖喱豬排飯', 'Signature Pork Katsu Curry',
       '外酥內嫩，微辣咖喱醬。', 'Crispy pork cutlet with mildly spicy curry sauce.',
       9800, true, false, 'KATSU-001'
from c_rice
on conflict (sku) do nothing;

with c_noodles as (select id from categories where name_en='Noodles' order by id limit 1)
insert into products (category_id, name_zh, name_en, desc_zh, desc_en, price_cents, is_active, is_sold_out, sku)
select c_noodles.id, '醬油拉麵', 'Shoyu Ramen',
       '清爽醬油湯底與彈牙麵。', 'Light soy-based broth with springy noodles.',
       7800, true, false, 'RAMEN-001'
from c_noodles
on conflict (sku) do nothing;

-- =============================
-- RLS Helper Functions (STABLE)
-- =============================
create or replace function is_staff(uid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.users u
    where u.id = uid and u.role in ('admin','cashier','kitchen')
  );
$$;

create or replace function is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.users u
    where u.id = uid and u.role = 'admin'
  );
$$;

-- ====================
-- Enable RLS + Policies
-- ====================
alter table users enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='users_self_select' and tablename='users') then
    create policy users_self_select on users for select
      using (id = auth.uid());
  end if;
end $$;

alter table members enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='members_self_select' and tablename='members') then
    create policy members_self_select on members for select
      using (id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where policyname='members_self_update' and tablename='members') then
    create policy members_self_update on members for update
      using (id = auth.uid()) with check (id = auth.uid());
  end if;
end $$;

alter table categories enable row level security;
alter table products enable row level security;
alter table menus enable row level security;
alter table menu_items enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname='categories_public_read' and tablename='categories') then
    create policy categories_public_read on categories for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='products_public_read' and tablename='products') then
    create policy products_public_read on products for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='menus_public_read' and tablename='menus') then
    create policy menus_public_read on menus for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='menu_items_public_read' and tablename='menu_items') then
    create policy menu_items_public_read on menu_items for select using (true);
  end if;

  if not exists (select 1 from pg_policies where policyname='categories_staff_write' and tablename='categories') then
    create policy categories_staff_write on categories for all
      using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where policyname='products_staff_write' and tablename='products') then
    create policy products_staff_write on products for all
      using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where policyname='menus_staff_write' and tablename='menus') then
    create policy menus_staff_write on menus for all
      using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where policyname='menu_items_staff_write' and tablename='menu_items') then
    create policy menu_items_staff_write on menu_items for all
      using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
  end if;
end $$;

alter table orders enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='orders_member_select' and tablename='orders') then
    create policy orders_member_select on orders for select
      using (member_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where policyname='orders_member_insert' and tablename='orders') then
    create policy orders_member_insert on orders for insert
      with check (member_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where policyname='orders_member_update_pending' and tablename='orders') then
    create policy orders_member_update_pending on orders for update
      using (member_id = auth.uid() and status = 'pending') with check (member_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where policyname='orders_staff_all' and tablename='orders') then
    create policy orders_staff_all on orders for all
      using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
  end if;
end $$;

alter table order_items enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='order_items_member_select' and tablename='order_items') then
    create policy order_items_member_select on order_items for select
      using (exists (select 1 from orders o where o.id = order_id and o.member_id = auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where policyname='order_items_member_insert_pending' and tablename='order_items') then
    create policy order_items_member_insert_pending on order_items for insert
      with check (exists (select 1 from orders o where o.id = order_id and o.member_id = auth.uid() and o.status = 'pending'));
  end if;
  if not exists (select 1 from pg_policies where policyname='order_items_member_update_pending' and tablename='order_items') then
    create policy order_items_member_update_pending on order_items for update
      using (exists (select 1 from orders o where o.id = order_id and o.member_id = auth.uid() and o.status = 'pending'))
      with check (exists (select 1 from orders o where o.id = order_id and o.member_id = auth.uid() and o.status = 'pending'));
  end if;
  if not exists (select 1 from pg_policies where policyname='order_items_staff_all' and tablename='order_items') then
    create policy order_items_staff_all on order_items for all
      using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
  end if;
end $$;

alter table wallet_accounts enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='wallet_accounts_member_select' and tablename='wallet_accounts') then
    create policy wallet_accounts_member_select on wallet_accounts for select
      using (member_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where policyname='wallet_accounts_staff_update' and tablename='wallet_accounts') then
    create policy wallet_accounts_staff_update on wallet_accounts for update
      using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
  end if;
end $$;

alter table wallet_ledger enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='wallet_ledger_member_select' and tablename='wallet_ledger') then
    create policy wallet_ledger_member_select on wallet_ledger for select
      using (member_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where policyname='wallet_ledger_staff_insert' and tablename='wallet_ledger') then
    create policy wallet_ledger_staff_insert on wallet_ledger for insert
      with check (is_staff(auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where policyname='wallet_ledger_staff_select' and tablename='wallet_ledger') then
    create policy wallet_ledger_staff_select on wallet_ledger for select
      using (is_staff(auth.uid()));
  end if;
end $$;

alter table points_accounts enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='points_accounts_member_select' and tablename='points_accounts') then
    create policy points_accounts_member_select on points_accounts for select
      using (member_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where policyname='points_accounts_staff_update' and tablename='points_accounts') then
    create policy points_accounts_staff_update on points_accounts for update
      using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
  end if;
end $$;

alter table points_ledger enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='points_ledger_member_select' and tablename='points_ledger') then
    create policy points_ledger_member_select on points_ledger for select
      using (member_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where policyname='points_ledger_staff_insert' and tablename='points_ledger') then
    create policy points_ledger_staff_insert on points_ledger for insert
      with check (is_staff(auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where policyname='points_ledger_staff_select' and tablename='points_ledger') then
    create policy points_ledger_staff_select on points_ledger for select
      using (is_staff(auth.uid()));
  end if;
end $$;

alter table coupons enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='coupons_public_read_active' and tablename='coupons') then
    create policy coupons_public_read_active on coupons for select
      using (is_active and (starts_at is null or now() >= starts_at) and (ends_at is null or now() <= ends_at));
  end if;
  if not exists (select 1 from pg_policies where policyname='coupons_staff_write' and tablename='coupons') then
    create policy coupons_staff_write on coupons for all
      using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
  end if;
end $$;

alter table coupon_redemptions enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='coupon_redemptions_member_select' and tablename='coupon_redemptions') then
    create policy coupon_redemptions_member_select on coupon_redemptions for select
      using (member_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where policyname='coupon_redemptions_staff_insert' and tablename='coupon_redemptions') then
    create policy coupon_redemptions_staff_insert on coupon_redemptions for insert
      with check (is_staff(auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where policyname='coupon_redemptions_staff_select' and tablename='coupon_redemptions') then
    create policy coupon_redemptions_staff_select on coupon_redemptions for select
      using (is_staff(auth.uid()));
  end if;
end $$;

alter table news_posts enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='news_public_read_published' and tablename='news_posts') then
    create policy news_public_read_published on news_posts for select
      using (status = 'published');
  end if;
  if not exists (select 1 from pg_policies where policyname='news_staff_write' and tablename='news_posts') then
    create policy news_staff_write on news_posts for all
      using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
  end if;
end $$;

alter table contact_messages enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='contact_any_insert' and tablename='contact_messages') then
    create policy contact_any_insert on contact_messages for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='contact_staff_select' and tablename='contact_messages') then
    create policy contact_staff_select on contact_messages for select using (is_staff(auth.uid()));
  end if;
end $$;

alter table tables enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='tables_staff_all' and tablename='tables') then
    create policy tables_staff_all on tables for all
      using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
  end if;
end $$;

alter table inventory_items enable row level security;
alter table inventory_movements enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname='inventory_items_staff_all' and tablename='inventory_items') then
    create policy inventory_items_staff_all on inventory_items for all
      using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where policyname='inventory_movements_staff_all' and tablename='inventory_movements') then
    create policy inventory_movements_staff_all on inventory_movements for all
      using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
  end if;
end $$;

-- ==================
-- Notes
-- ==================
-- 1) In Supabase, ensure JWT/Session provides auth.uid(); keep public.users in sync on sign-up.
-- 2) Do wallet/points/coupon writes on server (service role) or SECURITY DEFINER functions.
-- 3) For multi-store setups, add store_id to relevant tables + scope policies accordingly.
