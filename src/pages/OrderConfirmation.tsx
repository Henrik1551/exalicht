import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice, formatAddress, Address } from '@/lib/order-utils';
import { Loader2 } from 'lucide-react';

interface OrderData {
  order_number: string;
  customer_name: string;
  customer_email: string;
  shipping_address: Address;
  subtotal: number;
  tax_amount: number;
  total: number;
  created_at: string;
}

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { language } = useLanguage();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) return;

      // Using raw query since types haven't been regenerated yet
      const { data, error } = await (supabase as unknown as {
        from: (table: string) => {
          select: (cols: string) => {
            eq: (col: string, val: string) => {
              single: () => Promise<{ data: unknown; error: Error | null }>
            }
          }
        }
      }).from('orders').select('*').eq('order_number', orderNumber).single();

      if (error) {
        console.error('Error fetching order:', error);
      } else if (data) {
        const orderData = data as Record<string, unknown>;
        setOrder({
          order_number: orderData.order_number as string,
          customer_name: orderData.customer_name as string,
          customer_email: orderData.customer_email as string,
          shipping_address: orderData.shipping_address as Address,
          subtotal: orderData.subtotal as number,
          tax_amount: orderData.tax_amount as number,
          total: orderData.total as number,
          created_at: orderData.created_at as string,
        });
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-12 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {language === 'de' ? 'Bestellung nicht gefunden' : 'Order not found'}
          </h1>
          <Button asChild>
            <Link to="/">{language === 'de' ? 'Zur Startseite' : 'Go to Home'}</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {language === 'de' ? 'Vielen Dank für Ihre Bestellung!' : 'Thank you for your order!'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'de'
                ? 'Ihre Bestellung wurde erfolgreich aufgegeben.'
                : 'Your order has been successfully placed.'}
            </p>
          </div>

          {/* Order Details Card */}
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Order Number */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'de' ? 'Bestellnummer' : 'Order Number'}
                  </p>
                  <p className="font-semibold text-lg">{order.order_number}</p>
                </div>
              </div>

              <Separator />

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2">
                  {language === 'de' ? 'Kundendaten' : 'Customer Details'}
                </h3>
                <p>{order.customer_name}</p>
                <p className="text-muted-foreground">{order.customer_email}</p>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-2">
                  {language === 'de' ? 'Lieferadresse' : 'Shipping Address'}
                </h3>
                <p className="text-muted-foreground">
                  {formatAddress(order.shipping_address)}
                </p>
              </div>

              <Separator />

              {/* Order Total */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{language === 'de' ? 'Zwischensumme (Netto)' : 'Subtotal (Net)'}</span>
                  <span>{formatPrice(order.subtotal, language)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{language === 'de' ? 'MwSt. (19%)' : 'VAT (19%)'}</span>
                  <span>{formatPrice(order.tax_amount, language)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>{language === 'de' ? 'Gesamt (Brutto)' : 'Total (Gross)'}</span>
                  <span>{formatPrice(order.total, language)}</span>
                </div>
              </div>

              <Separator />

              {/* Email Note */}
              <div className="bg-accent p-4 rounded-lg text-sm">
                <p className="text-accent-foreground">
                  {language === 'de'
                    ? `Eine Bestätigung wurde an ${order.customer_email} gesendet. Sie erhalten Ihre Rechnung nach Auftragsbearbeitung.`
                    : `A confirmation has been sent to ${order.customer_email}. You will receive your invoice after order processing.`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Continue Shopping */}
          <div className="mt-8 text-center">
            <Button asChild size="lg">
              <Link to="/products" className="gap-2">
                {language === 'de' ? 'Weiter einkaufen' : 'Continue Shopping'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
