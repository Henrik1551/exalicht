import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface CartSummaryProps {
  onCheckout?: () => void;
}

export function CartSummary({ onCheckout }: CartSummaryProps) {
  const { getTotal, getItemCount } = useCart();
  const { language } = useLanguage();

  const total = getTotal();
  const itemCount = getItemCount();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="border-t border-border pt-4 mt-4 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {language === 'de' ? 'Zwischensumme' : 'Subtotal'}
          </span>
          <span className="font-medium">{formatPrice(total)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {language === 'de'
            ? 'zzgl. MwSt. zzgl. Versandkosten'
            : 'excl. VAT, plus shipping'}
        </p>
      </div>

      <Button asChild className="w-full" onClick={onCheckout}>
        <Link to="/checkout">
          {language === 'de' ? 'Zur Kasse' : 'Proceed to Checkout'}
        </Link>
      </Button>

      <Button variant="outline" asChild className="w-full">
        <Link to="/products">
          {language === 'de' ? 'Weiter einkaufen' : 'Continue Shopping'}
        </Link>
      </Button>
    </div>
  );
}
