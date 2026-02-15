import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export interface Product {
  id: string;
  woo_id: number | null;
  sku: string | null;
  name: string;
  short_description: string | null;
  description: string | null;
  price: number | null;
  category: string | null;
  category_path: string | null;
  images: string[];
  in_stock: boolean;
  product_type: string;
  weight_kg: number | null;
  gtin: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  parent_slug: string | null;
  product_count: number;
  image: string | null;
}

export function useProducts(options?: {
  category?: string;
  sortBy?: string;
  productType?: string;
}) {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      const productsRef = collection(db, 'products');
      const constraints: ReturnType<typeof where>[] = [];

      // Filter by product type (exclude variations by default)
      if (options?.productType) {
        constraints.push(where('product_type', '==', options.productType));
      } else {
        constraints.push(where('product_type', '!=', 'variation'));
      }

      const q = query(productsRef, ...constraints);
      const snapshot = await getDocs(q);
      let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

      // Filter by category (client-side since Firestore doesn't support ILIKE)
      if (options?.category && options.category !== 'all') {
        const cat = options.category.toLowerCase();
        products = products.filter(p =>
          (p.category && p.category.toLowerCase().includes(cat)) ||
          (p.category_path && p.category_path.toLowerCase().includes(cat))
        );
      }

      // Sort client-side
      switch (options?.sortBy) {
        case 'price-asc':
          products.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
          break;
        case 'price-desc':
          products.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
          break;
        case 'name-asc':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          products.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'newest':
          products.sort((a, b) => b.created_at.localeCompare(a.created_at));
          break;
        default:
          products.sort((a, b) => {
            if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
            return a.name.localeCompare(b.name);
          });
      }

      return products;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const q = query(collection(db, 'categories'), orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    },
  });
}

export function useProductCount() {
  return useQuery({
    queryKey: ['product-count'],
    queryFn: async () => {
      const q = query(
        collection(db, 'products'),
        where('product_type', '!=', 'variation')
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    },
  });
}
