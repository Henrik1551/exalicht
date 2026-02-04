import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ConfiguratorItem {
  id: string;
  category: 'lichtkuppel' | 'aufsatzkranz' | 'luefterrahmen' | 'durchsturzsicherung' | 'zubehoer';
  article_number: string;
  name: string;
  description: string | null;
  width_cm: number | null;
  length_cm: number | null;
  diameter_cm: number | null;
  height_cm: number | null;
  material: string | null;
  shells: number | null;
  u_value: number | null;
  wall_thickness_mm: number | null;
  surface: string | null;
  form: string | null;
  purchase_price: number | null;
  sale_price: number;
  is_active: boolean;
}

export type ConfiguratorCategory = 'lichtkuppel' | 'aufsatzkranz' | 'luefterrahmen' | 'durchsturzsicherung' | 'zubehoer';

export function useConfiguratorItems(category?: ConfiguratorCategory) {
  return useQuery({
    queryKey: ['configurator-items', category],
    queryFn: async () => {
      let query = supabase
        .from('configurator_items')
        .select('*')
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category as any);
      }

      const { data, error } = await query.order('sale_price', { ascending: true });

      if (error) {
        console.error('Error fetching configurator items:', error);
        throw error;
      }

      return (data || []) as ConfiguratorItem[];
    },
  });
}

// Get unique sizes for a category
export function useConfiguratorSizes(category: ConfiguratorCategory, form: 'rechteckig' | 'rund') {
  return useQuery({
    queryKey: ['configurator-sizes', category, form],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configurator_items')
        .select('width_cm, length_cm, diameter_cm')
        .eq('category', category as any)
        .eq('is_active', true);

      if (error) throw error;

      if (form === 'rund') {
        // Get unique diameters
        const diameters = [...new Set(data?.map(d => d.diameter_cm).filter(Boolean))].sort((a, b) => (a || 0) - (b || 0));
        return diameters.map(d => ({ diameter_cm: d }));
      } else {
        // Get unique width x length combinations
        const sizes = data?.reduce((acc, item) => {
          if (item.width_cm && item.length_cm) {
            const key = `${item.width_cm}x${item.length_cm}`;
            if (!acc.find(s => `${s.width_cm}x${s.length_cm}` === key)) {
              acc.push({ width_cm: item.width_cm, length_cm: item.length_cm });
            }
          }
          return acc;
        }, [] as { width_cm: number; length_cm: number }[]);
        
        return sizes?.sort((a, b) => (a.width_cm * a.length_cm) - (b.width_cm * b.length_cm)) || [];
      }
    },
  });
}
