import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { calculateOrderTotals, formatPrice as formatPriceUtil } from '@/lib/order-utils';
import { Separator } from '@/components/ui/separator';

export function OrderSummary() {
  const { items, getTotal } = useCart();
  const { language } = useLanguage();

  const subtotal = getTotal();
  const { taxAmount, shippingCost, total } = calculateOrderTotals(subtotal);

  const formatPrice = (price: number) => formatPriceUtil(price, language);

  return (
    <div className="bg-muted/30 rounded-lg p-6 space-y-4">
      <h3 className="font-semibold text-lg">
        {language === 'de' ? 'Bestellübersicht' : 'Order Summary'}
      </h3>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm">
            <div className="flex-1">
              <p className="font-medium truncate pr-4">{item.name}</p>
              <p className="text-muted-foreground">
                {item.quantity} × {formatPrice(item.price)}
              </p>
            </div>
            <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      <Separator />

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {language === 'de' ? 'Zwischensumme (Netto)' : 'Subtotal (Net)'}
          </span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {language === 'de' ? 'MwSt. (19%)' : 'VAT (19%)'}
          </span>
          <span>{formatPrice(taxAmount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {language === 'de' ? 'Versand' : 'Shipping'}
          </span>
          <span>
            {shippingCost === 0
              ? language === 'de'
                ? 'Wird berechnet'
                : 'Calculated later'
              : formatPrice(shippingCost)}
          </span>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between font-semibold text-lg">
        <span>{language === 'de' ? 'Gesamt (Brutto)' : 'Total (Gross)'}</span>
        <span>{formatPrice(total)}</span>
      </div>

      <p className="text-xs text-muted-foreground">
        {language === 'de'
          ? 'Alle Preise inkl. 19% MwSt. Versandkosten werden nach Auftragseingang berechnet.'
          : 'All prices include 19% VAT. Shipping costs will be calculated after order receipt.'}
      </p>
    </div>
  );
}
