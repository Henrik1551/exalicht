import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Package, Star, ShoppingCart, Check, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { stripHtml } from '@/lib/html-utils';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch variations if this is a variable product
  const { data: variations } = useQuery({
    queryKey: ['product-variations', product?.woo_id],
    queryFn: async () => {
      if (!product?.woo_id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_type', 'variation')
        .order('price', { ascending: true });

      if (error) throw error;
      
      // Filter variations that belong to this parent (by checking category path similarity)
      return data?.filter(v => 
        v.category_path === product.category_path || 
        v.name.includes(product.name.split(' ')[0])
      ) || [];
    },
    enabled: product?.product_type === 'variable',
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  // Calculate price range from variations
  const priceRange = variations && variations.length > 0
    ? {
        min: Math.min(...variations.filter(v => v.price).map(v => v.price!)),
        max: Math.max(...variations.filter(v => v.price).map(v => v.price!)),
      }
    : null;

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-10">
          <div className="grid lg:grid-cols-2 gap-10">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {language === 'de' ? 'Produkt nicht gefunden' : 'Product not found'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'de' 
              ? 'Das gesuchte Produkt existiert nicht oder wurde entfernt.'
              : 'The product you are looking for does not exist or has been removed.'
            }
          </p>
          <Button asChild>
            <Link to="/products">
              <ChevronLeft className="mr-2 h-4 w-4" />
              {language === 'de' ? 'Zurück zu Produkten' : 'Back to Products'}
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const cleanDescription = stripHtml(product.description);
  const cleanShortDescription = stripHtml(product.short_description);

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b border-border py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/products" className="text-muted-foreground hover:text-foreground">
              {language === 'de' ? 'Produkte' : 'Products'}
            </Link>
            {product.category && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">{product.category}</span>
              </>
            )}
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-xl overflow-hidden flex items-center justify-center">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Package className="h-24 w-24 text-muted-foreground/30" />
                  <span className="text-sm text-muted-foreground/50 italic">
                    {language === 'de' ? 'Bild folgt...' : 'Image coming...'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Thumbnail gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.slice(0, 5).map((img, idx) => (
                  <button
                    key={idx}
                    className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.category && (
                <Badge variant="secondary">{product.category}</Badge>
              )}
              {product.is_featured && (
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="h-3 w-3 mr-1" />
                  Bestseller
                </Badge>
              )}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              {product.sku && (
                <p className="text-sm text-muted-foreground">
                  {language === 'de' ? 'Artikelnummer' : 'SKU'}: {product.sku}
                </p>
              )}
            </div>

            {/* Short Description */}
            {cleanShortDescription && (
              <p className="text-muted-foreground">
                {cleanShortDescription}
              </p>
            )}

            {/* Price */}
            <div className="py-4 border-y border-border">
              {priceRange && priceRange.min !== priceRange.max ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    {formatPrice(priceRange.min)} – {formatPrice(priceRange.max)}
                  </span>
                </div>
              ) : product.price ? (
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
              ) : (
                <span className="text-lg text-muted-foreground italic">
                  {language === 'de' ? 'Preis auf Anfrage' : 'Price on request'}
                </span>
              )}
              
              {/* Stock Status */}
              <div className="flex items-center gap-2 mt-2">
                {product.in_stock ? (
                  <>
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm text-primary">
                      {language === 'de' ? 'Auf Lager' : 'In stock'}
                    </span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">
                      {language === 'de' ? 'Nicht verfügbar' : 'Out of stock'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button size="lg" className="flex-1" disabled={!product.in_stock}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                {language === 'de' ? 'Anfrage senden' : 'Send inquiry'}
              </Button>
            </div>

            {/* Product Details */}
            {(product.weight_kg || product.gtin) && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-foreground mb-3">
                  {language === 'de' ? 'Produktdetails' : 'Product Details'}
                </h3>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {product.weight_kg && (
                    <>
                      <dt className="text-muted-foreground">
                        {language === 'de' ? 'Gewicht' : 'Weight'}
                      </dt>
                      <dd className="text-foreground">{product.weight_kg} kg</dd>
                    </>
                  )}
                  {product.gtin && (
                    <>
                      <dt className="text-muted-foreground">GTIN/EAN</dt>
                      <dd className="text-foreground">{product.gtin}</dd>
                    </>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Full Description */}
        {cleanDescription && (
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {language === 'de' ? 'Beschreibung' : 'Description'}
            </h2>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p className="whitespace-pre-line">{cleanDescription}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
