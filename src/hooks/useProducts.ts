import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      let query = supabase
        .from('products')
        .select('*');

      // Filter by category
      if (options?.category && options.category !== 'all') {
        query = query.or(`category.ilike.%${options.category}%,category_path.ilike.%${options.category}%`);
      }

      // Filter by product type (exclude variations by default for main listing)
      if (options?.productType) {
        query = query.eq('product_type', options.productType);
      } else {
        // By default, exclude variations (they should be shown with their parent)
        query = query.neq('product_type', 'variation');
      }

      // Apply sorting
      switch (options?.sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true, nullsFirst: false });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false, nullsFirst: false });
          break;
        case 'name-asc':
          query = query.order('name', { ascending: true });
          break;
        case 'name-desc':
          query = query.order('name', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('is_featured', { ascending: false }).order('name', { ascending: true });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return (data || []) as Product[];
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return (data || []) as Category[];
    },
  });
}

export function useProductCount() {
  return useQuery({
    queryKey: ['product-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .neq('product_type', 'variation');

      if (error) {
        console.error('Error fetching product count:', error);
        throw error;
      }

      return count || 0;
    },
  });
}
