import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export type ConfiguratorCategory = 'lichtkuppel' | 'aufsatzkranz' | 'luefterrahmen' | 'durchsturzsicherung' | 'zubehoer';

export interface ConfiguratorItem {
  id: string;
  category: ConfiguratorCategory;
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
  price_unit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useConfiguratorItems(category?: ConfiguratorCategory) {
  return useQuery({
    queryKey: ['configurator-items', category],
    queryFn: async () => {
      if (!category) return [];

      const itemsRef = collection(db, 'configurator_items');
      const q = query(
        itemsRef,
        where('category', '==', category),
        where('is_active', '==', true),
        orderBy('sale_price', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConfiguratorItem));
    },
    enabled: !!category,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
}
