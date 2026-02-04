-- Enum for product categories in configurator
CREATE TYPE public.configurator_category AS ENUM (
  'lichtkuppel',
  'aufsatzkranz',
  'luefterrahmen',
  'durchsturzsicherung',
  'zubehoer'
);

-- Main table for configurator pricing items
CREATE TABLE public.configurator_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category configurator_category NOT NULL,
  article_number text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  
  -- Dimensions (for lichtkuppeln and kränze)
  width_cm integer,
  length_cm integer,
  diameter_cm integer,
  height_cm integer,
  
  -- Material properties
  material text, -- AC, HS, PC, GFK, ALU, PVC
  shells integer, -- 1-5 for lichtkuppeln
  u_value decimal(3,1), -- U-Wert W/m²K
  wall_thickness_mm integer, -- Wandstärke
  
  -- Surface finish (for Durchsturzsicherung)
  surface text, -- RAL9010, verzinkt, RAL9010+verzinkt
  
  -- Form
  form text, -- rechteckig, rund, quadratisch, schraeg, gerade
  
  -- Pricing
  purchase_price decimal(10,2),
  sale_price decimal(10,2) NOT NULL,
  price_unit integer DEFAULT 1,
  
  -- Status
  is_active boolean DEFAULT true,
  
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Index for faster lookups
CREATE INDEX idx_configurator_items_category ON public.configurator_items(category);
CREATE INDEX idx_configurator_items_dimensions ON public.configurator_items(width_cm, length_cm, diameter_cm);
CREATE INDEX idx_configurator_items_material ON public.configurator_items(material);

-- Enable RLS
ALTER TABLE public.configurator_items ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Configurator items are publicly readable"
  ON public.configurator_items FOR SELECT
  USING (true);

-- Admin management
CREATE POLICY "Admins can manage configurator items"
  ON public.configurator_items FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_configurator_items_updated_at
  BEFORE UPDATE ON public.configurator_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Table for configurator configurations/quotes
CREATE TABLE public.configurator_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  
  -- Form selection
  form text NOT NULL, -- rechteckig, rund
  
  -- Lichtkuppel
  lichtkuppel_item_id uuid REFERENCES public.configurator_items(id),
  lichtkuppel_price decimal(10,2),
  
  -- Aufsatzkranz
  aufsatzkranz_item_id uuid REFERENCES public.configurator_items(id),
  aufsatzkranz_price decimal(10,2),
  vormontage boolean DEFAULT false,
  
  -- Lüfterrahmen
  luefterrahmen_item_id uuid REFERENCES public.configurator_items(id),
  luefterrahmen_price decimal(10,2),
  
  -- Durchsturzsicherung
  durchsturzsicherung_item_id uuid REFERENCES public.configurator_items(id),
  durchsturzsicherung_price decimal(10,2),
  
  -- Totals
  quantity integer DEFAULT 1,
  subtotal decimal(10,2),
  
  -- Status
  status text DEFAULT 'draft', -- draft, submitted, quoted, ordered
  
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.configurator_quotes ENABLE ROW LEVEL SECURITY;

-- Users can view their own quotes
CREATE POLICY "Users can view their own quotes"
  ON public.configurator_quotes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own quotes
CREATE POLICY "Users can create quotes"
  ON public.configurator_quotes FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can manage all quotes
CREATE POLICY "Admins can manage all quotes"
  ON public.configurator_quotes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_configurator_quotes_updated_at
  BEFORE UPDATE ON public.configurator_quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();