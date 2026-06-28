ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS confirmation_email_sent BOOLEAN DEFAULT FALSE;
