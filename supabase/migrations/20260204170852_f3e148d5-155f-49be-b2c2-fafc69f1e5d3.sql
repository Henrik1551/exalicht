-- Add stock quantity column to products
ALTER TABLE public.products 
ADD COLUMN stock_quantity integer DEFAULT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN public.products.stock_quantity IS 'Number of units available in stock. NULL means quantity is not tracked.';