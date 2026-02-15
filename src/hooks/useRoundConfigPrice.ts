import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RoundConfigParams {
  ulw_cm: number;
  material: string;
  optik: string;
  schale: number;
  hoehe_cm: number;
  daemmung_mm: number;
  luefterrahmen_variante: string;
}

export interface RoundConfigPriceResult {
  lichtkuppel_preis: number;
  aufsatzkranz_preis: number;
  luefterrahmen_preis: number;
  zusatzkosten: number;
  total_preis: number;
}

/**
 * Look up the price for a specific round skylight configuration.
 * Calls the get_round_config_price RPC function.
 */
export function useRoundConfigPrice(params: RoundConfigParams | null) {
  return useQuery({
    queryKey: ['round-config-price', params],
    queryFn: async () => {
      if (!params) return null;

      const { data, error } = await supabase.rpc('get_round_config_price', {
        p_ulw_cm: params.ulw_cm,
        p_material: params.material,
        p_optik: params.optik,
        p_schale: params.schale,
        p_hoehe_cm: params.hoehe_cm,
        p_daemmung_mm: params.daemmung_mm,
        p_luefterrahmen_variante: params.luefterrahmen_variante,
      });

      if (error) {
        console.error('Error fetching round config price:', error);
        throw error;
      }

      if (!data || data.length === 0) return null;
      return data[0] as RoundConfigPriceResult;
    },
    enabled: !!params,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
}

/**
 * Get available Lüfterrahmen variants for a given diameter.
 * Some variants are only available for certain diameter ranges.
 */
export function useRoundLuefterrahmenVariants(ulw_cm: number) {
  return useQuery({
    queryKey: ['round-luefterrahmen-variants', ulw_cm],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_round_luefterrahmen_variants', {
        p_ulw_cm: ulw_cm,
      });

      if (error) {
        console.error('Error fetching luefterrahmen variants:', error);
        throw error;
      }

      return (data || []).map((r: { luefterrahmen_variante: string }) => r.luefterrahmen_variante);
    },
    enabled: ulw_cm > 0,
    staleTime: 1000 * 60 * 30, // 30 minutes cache (variants don't change often)
  });
}
