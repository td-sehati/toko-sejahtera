-- Schema for Kasir Database (duplicated structure without data)
-- This can be used to create the same table structure in a new Supabase project

CREATE TABLE public.categories (
  id text NOT NULL,
  name text NOT NULL,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

CREATE TABLE public.customers (
  id text NOT NULL,
  name text NOT NULL,
  phone text,
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);

CREATE TABLE public.suppliers (
  id text NOT NULL,
  name text NOT NULL,
  phone text,
  CONSTRAINT suppliers_pkey PRIMARY KEY (id)
);

CREATE TABLE public.expenses (
  id text NOT NULL,
  category text,
  description text,
  amount numeric DEFAULT 0,
  date text,
  CONSTRAINT expenses_pkey PRIMARY KEY (id)
);

CREATE TABLE public.manual_journal_entries (
  id text NOT NULL,
  date text,
  description text,
  amount numeric DEFAULT 0,
  type text,
  category text,
  CONSTRAINT manual_journal_entries_pkey PRIMARY KEY (id)
);

CREATE TABLE public.payables (
  id text NOT NULL,
  supplierId text,
  description text,
  totalAmount numeric DEFAULT 0,
  paidAmount numeric DEFAULT 0,
  dueDate text,
  createdAt text,
  payments jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT payables_pkey PRIMARY KEY (id),
  CONSTRAINT payables_supplierId_fkey FOREIGN KEY (supplierId) REFERENCES public.suppliers(id)
);

CREATE TABLE public.products (
  id text NOT NULL,
  name text NOT NULL,
  sku text,
  category text,
  price numeric DEFAULT 0,
  hpp numeric DEFAULT 0,
  stock numeric DEFAULT 0,
  imageUrl text,
  isDivisible boolean DEFAULT false,
  trackStock boolean DEFAULT true,
  CONSTRAINT products_pkey PRIMARY KEY (id)
);

CREATE TABLE public.receivables (
  id text NOT NULL,
  customerId text,
  transactionId text,
  totalAmount numeric DEFAULT 0,
  paidAmount numeric DEFAULT 0,
  dueDate text,
  createdAt text,
  payments jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT receivables_pkey PRIMARY KEY (id),
  CONSTRAINT receivables_customerId_fkey FOREIGN KEY (customerId) REFERENCES public.customers(id)
);

CREATE TABLE public.saved_orders (
  id text NOT NULL,
  name text,
  cart jsonb,
  createdAt text,
  CONSTRAINT saved_orders_pkey PRIMARY KEY (id)
);

CREATE TABLE public.transactions (
  id text NOT NULL,
  items jsonb NOT NULL,
  total numeric DEFAULT 0,
  totalHPP numeric DEFAULT 0,
  paymentMethod text,
  customerId text,
  createdAt text,
  CONSTRAINT transactions_pkey PRIMARY KEY (id)
);