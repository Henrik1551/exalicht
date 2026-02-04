import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Checkout() {
  const { items } = useCart();
  const { language } = useLanguage();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              {language === 'de' ? 'Ihr Warenkorb ist leer' : 'Your cart is empty'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {language === 'de'
                ? 'Fügen Sie Produkte hinzu, um zur Kasse zu gehen.'
                : 'Add products to proceed to checkout.'}
            </p>
            <Button asChild>
              <Link to="/products">
                {language === 'de' ? 'Produkte ansehen' : 'Browse Products'}
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Back link */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {language === 'de' ? 'Weiter einkaufen' : 'Continue Shopping'}
        </Link>

        <h1 className="text-3xl font-bold mb-8">
          {language === 'de' ? 'Kasse' : 'Checkout'}
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <CheckoutForm />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
