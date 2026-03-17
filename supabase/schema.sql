-- ============================================================
-- StockPulse — Supabase Schema
-- Виконай цей SQL у Supabase Dashboard → SQL Editor
-- ============================================================

-- Увімкнення uuid
create extension if not exists "uuid-ossp";

-- ── Таблиця products ──────────────────────────────────────
create table if not exists products (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  sku           text not null unique,
  category      text not null,
  quantity      integer not null default 0,
  price         numeric(12,2) not null default 0,
  low_stock_threshold integer not null default 10,
  description   text
);

-- Індекс для пошуку по SKU
create index if not exists idx_products_sku on products (sku);
-- Індекс для фільтрації по категорії
create index if not exists idx_products_category on products (category);

-- ── Таблиця users ─────────────────────────────────────────
create table if not exists users (
  id              uuid primary key default uuid_generate_v4(),
  username        text not null unique,
  password        text not null,
  full_name       text not null,
  rank            text not null,
  unit            text not null,
  callsign        text,
  clearance_level text not null default 'Без допуску',
  role            text not null default 'user',
  is_active       boolean not null default true,
  created_at      timestamptz default now()
);

-- Індекс для пошуку по username
create index if not exists idx_users_username on users (username);

-- ── Row Level Security (RLS) ──────────────────────────────
-- Вимикаємо RLS для service_role key (бекенд)
-- Якщо використовується service_role key, RLS не блокує запити
alter table products enable row level security;
alter table users enable row level security;

-- Дозволяємо всі операції для service_role (бекенд-запити)
create policy "Service role full access to products"
  on products for all
  using (true)
  with check (true);

create policy "Service role full access to users"
  on users for all
  using (true)
  with check (true);
