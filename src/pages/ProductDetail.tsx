import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Package, Star, ShoppingCart, Check, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { stripHtml } from '@/lib/html-utils';

// Sanitize HTML by removing script tags, event handlers, and cleaning up escaped newlines
function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove on* event handlers
  sanitized = sanitized.replace(/\son\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/\son\w+='[^']*'/gi, '');
  
  // Remove data-inview and similar attributes that add clutter
  sanitized = sanitized.replace(/\s(data-inview|class)="[^"]*"/gi, '');
  
  // Remove literal \n sequences (escaped newlines stored as text)
  sanitized = sanitized.replace(/\\n/g, '');
  
  // Clean up excessive whitespace
  sanitized = sanitized.replace(/\s{3,}/g, ' ');
  
  return sanitized.trim();
}

// Clean text for short description (strip HTML + clean \n)
function cleanTextContent(html: string | null): string {
  if (!html) return '';
  
  // Strip HTML tags
  const doc = new DOMParser().parseFromString(html, 'text/html');
  let text = doc.body.textContent || '';
  
  // Remove literal \n sequences
  text = text.replace(/\\n/g, ' ');
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      const docRef = doc(db, 'products', id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as Record<string, unknown> & { id: string };
    },
    enabled: !!id,
  });

  // Fetch variations if this is a variable product
  const { data: variations } = useQuery({
    queryKey: ['product-variations', product?.woo_id],
    queryFn: async () => {
      if (!product?.woo_id) return [];

      const q = query(
        collection(db, 'products'),
        where('product_type', '==', 'variation'),
        orderBy('price', 'asc')
      );
      const snapshot = await getDocs(q);
      const allVariations = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Record<string, unknown> & { id: string }));

      // Filter variations that belong to this parent
      return allVariations.filter(v =>
        v.category_path === product.category_path ||
        (typeof v.name === 'string' && typeof product.name === 'string' && v.name.includes((product.name as string).split(' ')[0]))
      );
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

  // Use the cleanTextContent function that handles \n
  const shortDescriptionText = cleanTextContent(product.short_description);

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
            {product.short_description && (
              <div 
                className="text-muted-foreground prose prose-sm max-w-none
                  [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mt-0 [&_h1]:mb-2
                  [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-0 [&_h2]:mb-2
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-0 [&_ul]:space-y-1
                  [&_li]:text-muted-foreground [&_li]:text-sm
                  [&_p]:mb-2
                "
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.short_description) }}
              />
            )}

            {/* Price */}
            <div className="py-4 border-y border-border">
              {priceRange && priceRange.min !== priceRange.max ? (
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-foreground">
                    {formatPrice(priceRange.min)} – {formatPrice(priceRange.max)}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">
                    {language === 'de' ? 'zzgl. MwSt. zzgl. Versandkosten' : 'excl. VAT, plus shipping'}
                  </span>
                </div>
              ) : product.price ? (
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">
                    {language === 'de' ? 'zzgl. MwSt. zzgl. Versandkosten' : 'excl. VAT, plus shipping'}
                  </span>
                </div>
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

        {/* Full Description - rendered as HTML */}
        {product.description && (
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">
              {language === 'de' ? 'Beschreibung' : 'Description'}
            </h2>
            <div 
              className="product-description prose prose-sm max-w-none
                [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mt-6 [&_h1]:mb-3
                [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-6 [&_h2]:mb-3
                [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-4 [&_h3]:mb-2
                [&_p]:text-muted-foreground [&_p]:mb-3
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-2
                [&_li]:text-muted-foreground
                [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
                [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm
                [&_tr:nth-child(odd)]:bg-muted/30
                [&_strong]:font-semibold [&_strong]:text-foreground
              "
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
