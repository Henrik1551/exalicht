import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

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
 * Generate a deterministic document ID from config params.
 * This allows O(1) lookups instead of queries.
 */
export function makeConfigDocId(params: RoundConfigParams): string {
  return `${params.ulw_cm}_${params.schale}_${params.hoehe_cm}_${params.daemmung_mm}_${encodeURIComponent(params.material)}_${encodeURIComponent(params.optik)}_${encodeURIComponent(params.luefterrahmen_variante)}`;
}

/**
 * Look up the price for a specific round skylight configuration.
 * Uses a deterministic document ID for a single Firestore read.
 */
export function useRoundConfigPrice(params: RoundConfigParams | null) {
  return useQuery({
    queryKey: ['round-config-price', params],
    queryFn: async () => {
      if (!params) return null;

      const docId = makeConfigDocId(params);
      const docRef = doc(db, 'round_config_prices', docId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) return null;

      const data = snapshot.data();
      return {
        lichtkuppel_preis: data.lichtkuppel_preis,
        aufsatzkranz_preis: data.aufsatzkranz_preis,
        luefterrahmen_preis: data.luefterrahmen_preis,
        zusatzkosten: data.zusatzkosten,
        total_preis: data.total_preis,
      } as RoundConfigPriceResult;
    },
    enabled: !!params,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
}

/**
 * Get available Lüfterrahmen variants for a given diameter.
 * Queries the luefterrahmen_variants subcollection (pre-computed).
 */
export function useRoundLuefterrahmenVariants(ulw_cm: number) {
  return useQuery({
    queryKey: ['round-luefterrahmen-variants', ulw_cm],
    queryFn: async () => {
      // Query the variants lookup collection
      const docRef = doc(db, 'round_config_variants', String(ulw_cm));
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        return snapshot.data().luefterrahmen_varianten as string[];
      }

      // Fallback: query distinct variants from round_config_prices (slower)
      const q = query(
        collection(db, 'round_config_prices'),
        where('ulw_cm', '==', ulw_cm)
      );
      const pricesSnapshot = await getDocs(q);
      const variants = new Set<string>();
      pricesSnapshot.docs.forEach(doc => {
        variants.add(doc.data().luefterrahmen_variante);
      });
      return Array.from(variants).sort();
    },
    enabled: ulw_cm > 0,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });
}
