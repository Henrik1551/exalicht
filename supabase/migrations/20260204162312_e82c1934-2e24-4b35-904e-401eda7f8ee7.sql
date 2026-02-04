-- Create products table for WooCommerce import
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    woo_id INTEGER,
    sku TEXT,
    name TEXT NOT NULL,
    short_description TEXT,
    description TEXT,
    price DECIMAL(10, 2),
    category TEXT,
    category_path TEXT,
    images TEXT[] DEFAULT '{}',
    in_stock BOOLEAN DEFAULT true,
    product_type TEXT DEFAULT 'simple',
    parent_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    weight_kg DECIMAL(10, 3),
    gtin TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_en TEXT,
    parent_slug TEXT,
    product_count INTEGER DEFAULT 0,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_woo_id ON public.products(woo_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_product_type ON public.products(product_type);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent ON public.categories(parent_slug);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public read access for products (catalog is public)
CREATE POLICY "Products are publicly readable"
ON public.products
FOR SELECT
USING (true);

-- Public read access for categories
CREATE POLICY "Categories are publicly readable"
ON public.categories
FOR SELECT
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();