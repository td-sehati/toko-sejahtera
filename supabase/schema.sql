-- LunasKas / Kasir2
-- Fresh Supabase schema for this app.
-- Safe to run on a new project from Supabase SQL Editor.

begin;

create extension if not exists pgcrypto;

-- Optional cleanup for a truly fresh install.
drop table if exists public.manual_journal_entries cascade;
drop table if exists public.saved_orders cascade;
drop table if exists public.expenses cascade;
drop table if exists public.payables cascade;
drop table if exists public.receivables cascade;
drop table if exists public.transactions cascade;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.customers cascade;
drop table if exists public.suppliers cascade;

create table public.categories (
  id text primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.customers (
  id text primary key,
  name text not null,
  phone text not null default '',
  created_at timestamptz not null default now()
);

create table public.suppliers (
  id text primary key,
  name text not null,
  phone text not null default '',
  created_at timestamptz not null default now()
);

create table public.products (
  id text primary key,
  name text not null,
  sku text not null default '' unique,
  category text not null default '',
  price numeric(14,2) not null default 0 check (price >= 0),
  hpp numeric(14,2) not null default 0 check (hpp >= 0),
  stock numeric(14,3) not null default 0 check (stock >= 0),
  image_url text,
  is_divisible boolean not null default false,
  track_stock boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.transactions (
  id text primary key,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
  discount numeric(14,2) not null default 0 check (discount >= 0),
  total numeric(14,2) not null default 0 check (total >= 0),
  total_hpp numeric(14,2) not null default 0 check (total_hpp >= 0),
  payment_method text not null check (payment_method in ('Cash', 'QRIS', 'Card', 'Transfer', 'Pay Later')),
  customer_id text references public.customers(id) on update cascade on delete set null,
  created_at timestamptz not null default now()
);

create table public.receivables (
  id text primary key,
  customer_id text not null references public.customers(id) on update cascade on delete restrict,
  transaction_id text not null references public.transactions(id) on update cascade on delete cascade,
  total_amount numeric(14,2) not null default 0 check (total_amount >= 0),
  paid_amount numeric(14,2) not null default 0 check (paid_amount >= 0),
  due_date timestamptz not null,
  created_at timestamptz not null default now(),
  payments jsonb not null default '[]'::jsonb
);

create table public.payables (
  id text primary key,
  supplier_id text not null references public.suppliers(id) on update cascade on delete restrict,
  description text not null default '',
  total_amount numeric(14,2) not null default 0 check (total_amount >= 0),
  paid_amount numeric(14,2) not null default 0 check (paid_amount >= 0),
  due_date timestamptz not null,
  created_at timestamptz not null default now(),
  payments jsonb not null default '[]'::jsonb
);

create table public.expenses (
  id text primary key,
  category text not null check (category in ('Salary', 'Rent', 'Utilities', 'Marketing', 'Transport', 'Other')),
  description text not null,
  amount numeric(14,2) not null default 0 check (amount >= 0),
  date timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.saved_orders (
  id text primary key,
  name text not null,
  cart jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.manual_journal_entries (
  id text primary key,
  date timestamptz not null,
  description text not null,
  amount numeric(14,2) not null default 0 check (amount >= 0),
  type text not null check (type in ('Masuk', 'Keluar')),
  category text not null check (category in ('Modal Awal', 'Prive', 'Pendapatan Lain', 'Pengeluaran Lain')),
  created_at timestamptz not null default now()
);

create index idx_products_category on public.products(category);
create index idx_transactions_created_at on public.transactions(created_at desc);
create index idx_transactions_customer_id on public.transactions(customer_id);
create index idx_receivables_customer_id on public.receivables(customer_id);
create index idx_receivables_transaction_id on public.receivables(transaction_id);
create index idx_receivables_due_date on public.receivables(due_date);
create index idx_payables_supplier_id on public.payables(supplier_id);
create index idx_payables_due_date on public.payables(due_date);
create index idx_expenses_date on public.expenses(date desc);
create index idx_saved_orders_created_at on public.saved_orders(created_at desc);
create index idx_manual_journal_entries_date on public.manual_journal_entries(date desc);

insert into public.categories (id, name) values
  ('cat-1', 'Minuman'),
  ('cat-2', 'Roti'),
  ('cat-3', 'Pakaian'),
  ('cat-4', 'ATK'),
  ('cat-5', 'Sayuran')
on conflict (id) do nothing;

insert into public.customers (id, name, phone) values
  ('cust-1', 'Andi Budianto', '081234567890'),
  ('cust-2', 'Citra Lestari', '082345678901')
on conflict (id) do nothing;

insert into public.suppliers (id, name, phone) values
  ('sup-1', 'Supplier Kopi Nusantara', '085678901234'),
  ('sup-2', 'Pabrik Roti Lezat', '087890123456')
on conflict (id) do nothing;

insert into public.products (
  id, name, sku, category, price, hpp, stock, image_url, is_divisible, track_stock
) values
  ('prod-1', 'Kopi Susu Gula Aren', 'KS-GA-01', 'Minuman', 18000, 7000, 50, 'https://picsum.photos/id/237/200/200', false, true),
  ('prod-2', 'Croissant Cokelat', 'CR-CH-01', 'Roti', 22000, 9000, 30, 'https://picsum.photos/id/238/200/200', false, true),
  ('prod-3', 'Teh Melati', 'TM-01', 'Minuman', 12000, 3000, 100, 'https://picsum.photos/id/239/200/200', false, true),
  ('prod-4', 'Kaos Polos Hitam S', 'KP-H-S', 'Pakaian', 75000, 35000, 25, 'https://picsum.photos/id/240/200/200', false, true),
  ('prod-5', 'Buku Tulis A5', 'BT-A5', 'ATK', 8000, 4000, 200, 'https://picsum.photos/id/241/200/200', false, true),
  ('prod-6', 'Air Mineral 600ml', 'AM-600', 'Minuman', 5000, 2000, 150, 'https://picsum.photos/id/242/200/200', false, true),
  ('prod-7', 'Mentimun (per kg)', 'VEG-CU-01', 'Sayuran', 10000, 8000, 15, 'https://picsum.photos/id/243/200/200', true, true)
on conflict (id) do nothing;

-- Direct browser client access is used in this project.
-- These policies allow anon/authenticated access for app development.
alter table public.categories enable row level security;
alter table public.customers enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.transactions enable row level security;
alter table public.receivables enable row level security;
alter table public.payables enable row level security;
alter table public.expenses enable row level security;
alter table public.saved_orders enable row level security;
alter table public.manual_journal_entries enable row level security;

create policy "categories_all" on public.categories for all using (true) with check (true);
create policy "customers_all" on public.customers for all using (true) with check (true);
create policy "suppliers_all" on public.suppliers for all using (true) with check (true);
create policy "products_all" on public.products for all using (true) with check (true);
create policy "transactions_all" on public.transactions for all using (true) with check (true);
create policy "receivables_all" on public.receivables for all using (true) with check (true);
create policy "payables_all" on public.payables for all using (true) with check (true);
create policy "expenses_all" on public.expenses for all using (true) with check (true);
create policy "saved_orders_all" on public.saved_orders for all using (true) with check (true);
create policy "manual_journal_entries_all" on public.manual_journal_entries for all using (true) with check (true);

commit;
