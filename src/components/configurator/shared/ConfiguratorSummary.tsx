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
  unitTotal: number;
  total: number;
  lichtkuppelFound: boolean;
  kranzFound?: boolean;
  luefterFound: boolean;
}

interface ConfigDetails {
  size: string;
  material: string;
  optik: string;
  shells: number;
  uValue: number;
  kranzHeight?: number;
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

const formatPriceOrNA = (price: number, found: boolean) => {
  if (!found && price === 0) return 'auf Anfrage';
  return formatPrice(price);
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

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          {language === 'de' ? 'Zusammenfassung' : 'Summary'}
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'de' ? 'Lüfterrahmen' : 'Frame'}:</span>
                <span className="font-medium">{config.luefterrahmen}</span>
              </div>
            </div>

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Lichtkuppel:</span>
                <span className={!prices.lichtkuppelFound ? 'text-amber-600' : ''}>
                  {formatPriceOrNA(prices.lichtkuppel, prices.lichtkuppelFound)}
                </span>
              </div>
              {showKranz && prices.kranz !== undefined && (
                <div className="flex justify-between text-sm">
                  <span>Aufsatzkranz:</span>
                  <span className={!prices.kranzFound ? 'text-amber-600' : ''}>
                    {formatPriceOrNA(prices.kranz, prices.kranzFound ?? false)}
                  </span>
                </div>
              )}
              {prices.luefter > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Lüfterrahmen:</span>
                  <span className={!prices.luefterFound ? 'text-amber-600' : ''}>
                    {formatPriceOrNA(prices.luefter, prices.luefterFound)}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Unit Price */}
            <div className="flex justify-between font-medium">
              <span>{language === 'de' ? 'Stückpreis' : 'Unit Price'}:</span>
              <span className={!prices.lichtkuppelFound ? 'text-amber-600' : ''}>
                {prices.lichtkuppelFound ? formatPrice(prices.unitTotal) : 'auf Anfrage'}
              </span>
            </div>

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
  );
}
