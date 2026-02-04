import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Star, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/products-data';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { language } = useLanguage();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300">
      {/* Image */}
      <div className="aspect-square bg-muted flex flex-col items-center justify-center relative overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <>
            <Package className="h-16 w-16 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xs text-muted-foreground/50 mt-2 italic">
              {language === 'de' ? 'Bild folgt...' : 'Image coming...'}
            </span>
          </>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <Badge className="bg-accent-foreground text-accent hover:bg-accent-foreground/90">
              {language === 'de' ? 'Neu' : 'New'}
            </Badge>
          )}
          {product.isBestseller && (
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              <Star className="h-3 w-3 mr-1" />
              Bestseller
            </Badge>
          )}
        </div>

        {/* Stock indicator */}
        {!product.inStock && (
          <Badge variant="destructive" className="absolute top-3 right-3">
            {language === 'de' ? 'Ausverkauft' : 'Out of stock'}
          </Badge>
        )}

        {/* Quick actions */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full shadow-md">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="icon" className="h-10 w-10 rounded-full shadow-md" disabled={!product.inStock}>
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {product.category}
          </span>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-1">
          {product.features.slice(0, 2).map((feature, idx) => (
            <span key={idx} className="text-xs bg-muted px-2 py-0.5 rounded">
              {feature}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            {product.maxPrice ? (
              <span className="font-bold text-lg text-foreground">
                {formatPrice(product.minPrice)} – {formatPrice(product.maxPrice)}
              </span>
            ) : (
              <span className="font-bold text-lg text-foreground">
                {formatPrice(product.minPrice)}
              </span>
            )}
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to={`/products/${product.id}`}>
              {language === 'de' ? 'Details' : 'View'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
