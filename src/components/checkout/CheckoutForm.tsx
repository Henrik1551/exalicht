import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AddressForm, AddressFormValues } from './AddressForm';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { calculateOrderTotals } from '@/lib/order-utils';

const customerSchema = z.object({
  email: z.string().email('Gültige E-Mail erforderlich'),
  name: z.string().min(2, 'Name ist erforderlich'),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  sameAsBilling: z.boolean().default(true),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Sie müssen die AGB akzeptieren',
  }),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export function CheckoutForm() {
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<AddressFormValues | null>(null);
  const [shippingValid, setShippingValid] = useState(false);
  const [billingAddress, setBillingAddress] = useState<AddressFormValues | null>(null);
  const [billingValid, setBillingValid] = useState(false);
  
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      email: user?.email || '',
      name: '',
      phone: '',
      company: '',
      notes: '',
      sameAsBilling: true,
      acceptTerms: false,
    },
  });

  const sameAsBilling = form.watch('sameAsBilling');

  const onSubmit = async (values: CustomerFormValues) => {
    if (!shippingAddress || !shippingValid) {
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: language === 'de' 
          ? 'Bitte füllen Sie die Lieferadresse aus' 
          : 'Please fill in the shipping address',
        variant: 'destructive',
      });
      return;
    }

    const finalBillingAddress = sameAsBilling ? shippingAddress : billingAddress;
    if (!sameAsBilling && (!billingAddress || !billingValid)) {
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: language === 'de' 
          ? 'Bitte füllen Sie die Rechnungsadresse aus' 
          : 'Please fill in the billing address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const subtotal = getTotal();
      const { taxAmount, shippingCost, total } = calculateOrderTotals(subtotal);

      // Generate order number
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

      // Create order in Firestore
      const orderRef = await addDoc(collection(db, 'orders'), {
        order_number: orderNumber,
        user_id: user?.uid ?? null,
        customer_email: values.email,
        customer_name: values.name,
        customer_phone: values.phone || null,
        customer_company: values.company || null,
        shipping_address: shippingAddress,
        billing_address: finalBillingAddress,
        subtotal,
        tax_amount: taxAmount,
        shipping_cost: shippingCost,
        total,
        notes: values.notes || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Create order items as subcollection
      for (const item of items) {
        await addDoc(collection(db, 'orders', orderRef.id, 'items'), {
          product_id: item.productId,
          product_name: item.name,
          product_sku: item.sku,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          created_at: new Date().toISOString(),
        });
      }

      // Clear cart and redirect
      clearCart();

      toast({
        title: language === 'de' ? 'Bestellung aufgegeben!' : 'Order placed!',
        description: language === 'de'
          ? `Ihre Bestellnummer: ${orderNumber}`
          : `Your order number: ${orderNumber}`,
      });

      navigate(`/order-confirmation/${orderNumber}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: language === 'de' 
          ? 'Es gab einen Fehler bei der Bestellung. Bitte versuchen Sie es erneut.' 
          : 'There was an error placing your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">
          {language === 'de' ? 'Kontaktdaten' : 'Contact Information'}
        </h3>
        
        <Form {...form}>
          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'de' ? 'Name *' : 'Name *'}</FormLabel>
                    <FormControl>
                      <Input placeholder="Max Mustermann" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'de' ? 'E-Mail *' : 'Email *'}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@beispiel.de" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'de' ? 'Telefon' : 'Phone'}</FormLabel>
                    <FormControl>
                      <Input placeholder="+49 123 456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'de' ? 'Firma' : 'Company'}</FormLabel>
                    <FormControl>
                      <Input placeholder="Firma GmbH" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>

      {/* Shipping Address */}
      <AddressForm
        title={language === 'de' ? 'Lieferadresse' : 'Shipping Address'}
        onValuesChange={(values, isValid) => {
          setShippingAddress(values);
          setShippingValid(isValid);
        }}
      />

      {/* Same as billing checkbox */}
      <Form {...form}>
        <FormField
          control={form.control}
          name="sameAsBilling"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal cursor-pointer">
                {language === 'de'
                  ? 'Rechnungsadresse ist gleich Lieferadresse'
                  : 'Billing address is same as shipping'}
              </FormLabel>
            </FormItem>
          )}
        />
      </Form>

      {/* Billing Address (if different) */}
      {!sameAsBilling && (
        <AddressForm
          title={language === 'de' ? 'Rechnungsadresse' : 'Billing Address'}
          onValuesChange={(values, isValid) => {
            setBillingAddress(values);
            setBillingValid(isValid);
          }}
        />
      )}

      {/* Notes */}
      <Form {...form}>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {language === 'de' ? 'Anmerkungen zur Bestellung' : 'Order Notes'}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    language === 'de'
                      ? 'Besondere Hinweise zur Lieferung...'
                      : 'Special delivery instructions...'
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>

      {/* Terms and Submit */}
      <div className="space-y-4 pt-4 border-t border-border">
        <Form {...form}>
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex items-start gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div>
                  <FormLabel className="font-normal cursor-pointer">
                    {language === 'de'
                      ? 'Ich akzeptiere die AGB und Datenschutzbestimmungen *'
                      : 'I accept the Terms & Conditions and Privacy Policy *'}
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </Form>

        <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
          {language === 'de'
            ? 'Die Zahlung erfolgt auf Rechnung. Sie erhalten die Rechnung per E-Mail nach Auftragsbestätigung.'
            : 'Payment will be via invoice. You will receive the invoice by email after order confirmation.'}
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={loading || items.length === 0}
          onClick={form.handleSubmit(onSubmit)}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {language === 'de' ? 'Bestellung aufgeben' : 'Place Order'}
        </Button>
      </div>
    </div>
  );
}
