import { useRef, useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Info, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/order-utils';

interface PriceBreakdown {
  lichtkuppel: number;
  kranz?: number;
  luefter: number;
  zusatz: number;
  unitTotal: number;
  total: number;
  lichtkuppelFound: boolean;
  kranzFound?: boolean;
  luefterFound: boolean;
  zusatzFound: boolean;
}

interface ConfigDetails {
  size: string;
  material: string;
  optik: string;
  shells: number;
  uValue: number;
  kranzHeight?: number;
  daemmung?: number;
  luefterrahmen: string;
}

interface ConfiguratorSummaryProps {
  config: ConfigDetails;
  prices: PriceBreakdown;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  isLoading: boolean;
  showKranz?: boolean;
}

const formatPriceDisplay = (price: number, found: boolean) => {
  if (!found && price === 0) return 'auf Anfrage';
  return price.toFixed(2).replace('.', ',');
};

export function ConfiguratorSummary({
  config,
  prices,
  quantity,
  onQuantityChange,
  onAddToCart,
  isLoading,
  showKranz = true,
}: ConfiguratorSummaryProps) {
  const { language } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const [showFloating, setShowFloating] = useState(() => {
    // Default to true on mobile-sized screens (card is below the fold)
    return typeof window !== 'undefined' && window.innerWidth < 1024;
  });

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show floating bar when the real card is NOT visible
        setShowFloating(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Floating mobile price bar */}
      {showFloating && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background border-t shadow-[0_-4px_12px_rgba(0,0,0,0.1)] px-4 py-3">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-lg font-bold">
                  <span className={!prices.lichtkuppelFound ? 'text-amber-600' : 'text-primary'}>
                    {prices.lichtkuppelFound ? formatPrice(prices.unitTotal) : 'auf Anfrage'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {language === 'de' ? 'zzgl. MwSt.' : 'excl. VAT'}
                </p>
              </div>
              {prices.lichtkuppelFound ? (
                <Button onClick={onAddToCart} size="sm" className="shrink-0">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {language === 'de' ? 'In den Warenkorb' : 'Add to Cart'}
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="shrink-0">
                  {language === 'de' ? 'Angebot anfordern' : 'Request Quote'}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Full price summary card */}
      <Card ref={cardRef} className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {language === 'de' ? 'Preisübersicht' : 'Price Overview'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Configuration Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === 'de' ? 'Größe' : 'Size'}:</span>
                  <span className="font-medium">{config.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Material:</span>
                  <span className="font-medium">{config.material} {config.optik}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === 'de' ? 'Schalung' : 'Shells'}:</span>
                  <span className="font-medium">{config.shells}-schalig (U={config.uValue})</span>
                </div>
                {showKranz && config.kranzHeight && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === 'de' ? 'Aufsatzkranz' : 'Curb'}:</span>
                    <span className="font-medium">{config.kranzHeight} cm</span>
                  </div>
                )}
                {showKranz && config.daemmung && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === 'de' ? 'Dämmung' : 'Insulation'}:</span>
                    <span className="font-medium">{config.daemmung} mm</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === 'de' ? 'Lüfterrahmen' : 'Frame'}:</span>
                  <span className="font-medium">{config.luefterrahmen}</span>
                </div>
              </div>

              <Separator />

              {/* Price Input Fields */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="lichtkuppel-price" className="text-sm">
                    Lichtkuppel Preis (€)
                  </Label>
                  <Input
                    id="lichtkuppel-price"
                    type="text"
                    readOnly
                    value={formatPriceDisplay(prices.lichtkuppel, prices.lichtkuppelFound)}
                    className={`bg-muted ${!prices.lichtkuppelFound ? 'text-amber-600' : ''}`}
                  />
                </div>

                {showKranz && (
                  <div className="space-y-1">
                    <Label htmlFor="kranz-price" className="text-sm">
                      Aufsatzkranz Preis (€)
                    </Label>
                    <Input
                      id="kranz-price"
                      type="text"
                      readOnly
                      value={formatPriceDisplay(prices.kranz ?? 0, prices.kranzFound ?? false)}
                      className={`bg-muted ${!prices.kranzFound ? 'text-amber-600' : ''}`}
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="luefter-price" className="text-sm">
                    Lüfterrahmen Preis (€)
                  </Label>
                  <Input
                    id="luefter-price"
                    type="text"
                    readOnly
                    value={formatPriceDisplay(prices.luefter, prices.luefterFound)}
                    className={`bg-muted ${!prices.luefterFound ? 'text-amber-600' : ''}`}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="zusatz-price" className="text-sm">
                    Zusatzkosten (€)
                  </Label>
                  <Input
                    id="zusatz-price"
                    type="text"
                    readOnly
                    value={formatPriceDisplay(prices.zusatz, prices.zusatzFound)}
                    className="bg-muted"
                  />
                </div>
              </div>

              <Separator />

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <Label htmlFor="quantity" className="whitespace-nowrap">
                  {language === 'de' ? 'Menge' : 'Quantity'}:
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={100}
                  value={quantity}
                  onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20"
                />
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between text-lg font-bold">
                <span>{language === 'de' ? 'Gesamt' : 'Total'}:</span>
                <span className={!prices.lichtkuppelFound ? 'text-amber-600' : 'text-primary'}>
                  {prices.lichtkuppelFound ? formatPrice(prices.total) : 'auf Anfrage'}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                {language === 'de'
                  ? 'Alle Preise zzgl. MwSt. zzgl. Versandkosten'
                  : 'All prices excl. VAT, plus shipping'}
              </p>

              {/* Add to Cart */}
              {prices.lichtkuppelFound ? (
                <Button
                  onClick={onAddToCart}
                  className="w-full"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {language === 'de' ? 'In den Warenkorb' : 'Add to Cart'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {language === 'de' ? 'Angebot anfordern' : 'Request Quote'}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
