-- Round configuration prices lookup table
-- Stores the full pricing matrix for round skylight configurations (25,350 rows)
-- Sourced from manufacturer pricing data

CREATE TABLE public.round_config_prices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ulw_cm integer NOT NULL,
    material text NOT NULL,
    optik text NOT NULL,
    schale integer NOT NULL,
    hoehe_cm integer NOT NULL,
    daemmung_mm integer NOT NULL,
    luefterrahmen_variante text NOT NULL,
    lichtkuppel_preis numeric(10,2) NOT NULL DEFAULT 0,
    aufsatzkranz_preis numeric(10,2) NOT NULL DEFAULT 0,
    luefterrahmen_preis numeric(10,2) NOT NULL DEFAULT 0,
    zusatzkosten numeric(10,2) NOT NULL DEFAULT 0,
    total_preis numeric(10,2) NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Composite unique index for exact configuration lookups
CREATE UNIQUE INDEX idx_round_config_prices_lookup
ON public.round_config_prices (ulw_cm, material, optik, schale, hoehe_cm, daemmung_mm, luefterrahmen_variante);

-- Index for common query patterns
CREATE INDEX idx_round_config_prices_ulw ON public.round_config_prices (ulw_cm);
CREATE INDEX idx_round_config_prices_main ON public.round_config_prices (ulw_cm, material, schale);

-- Enable RLS
ALTER TABLE public.round_config_prices ENABLE ROW LEVEL SECURITY;

-- Public read access (prices are public)
CREATE POLICY "Round config prices are publicly readable"
ON public.round_config_prices FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can manage prices
CREATE POLICY "Admins can manage round config prices"
ON public.round_config_prices FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RPC function for efficient price lookup
-- Returns a single row matching the exact configuration
CREATE OR REPLACE FUNCTION public.get_round_config_price(
    p_ulw_cm integer,
    p_material text,
    p_optik text,
    p_schale integer,
    p_hoehe_cm integer,
    p_daemmung_mm integer,
    p_luefterrahmen_variante text
)
RETURNS TABLE (
    lichtkuppel_preis numeric,
    aufsatzkranz_preis numeric,
    luefterrahmen_preis numeric,
    zusatzkosten numeric,
    total_preis numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        lichtkuppel_preis,
        aufsatzkranz_preis,
        luefterrahmen_preis,
        zusatzkosten,
        total_preis
    FROM public.round_config_prices
    WHERE ulw_cm = p_ulw_cm
      AND material = p_material
      AND optik = p_optik
      AND schale = p_schale
      AND hoehe_cm = p_hoehe_cm
      AND daemmung_mm = p_daemmung_mm
      AND luefterrahmen_variante = p_luefterrahmen_variante
    LIMIT 1;
$$;

-- RPC function to get available luefterrahmen variants for a given diameter
CREATE OR REPLACE FUNCTION public.get_round_luefterrahmen_variants(p_ulw_cm integer)
RETURNS TABLE (luefterrahmen_variante text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT DISTINCT luefterrahmen_variante
    FROM public.round_config_prices
    WHERE ulw_cm = p_ulw_cm
    ORDER BY luefterrahmen_variante;
$$;
