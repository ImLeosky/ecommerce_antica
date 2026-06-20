-- Add Bold payment gateway fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS bold_payment_link_id TEXT,
ADD COLUMN IF NOT EXISTS bold_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS bold_status TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Disable RLS on orders so guests can insert/update
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
