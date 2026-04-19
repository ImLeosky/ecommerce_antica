-- add_product_fields.sql

-- Agregar campos 'available' y 'buyable' a la tabla 'products'
-- 'available' indica si el producto está disponible en el menú y vista de productos
-- 'buyable' indica si el producto se puede comprar desde la tienda (implica available)

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS buyable BOOLEAN DEFAULT false;

-- Nota: buyable debe ser validado en aplicación para asegurar que si buyable=true entonces available=true