import { ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CartIcon } from './CartIcon';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, clearCart } = useCart();
  const { language } = useLanguage();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div>
          <CartIcon onClick={() => setOpen(true)} />
        </div>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {language === 'de' ? 'Warenkorb' : 'Shopping Cart'}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {language === 'de' ? 'Ihr Warenkorb ist leer' : 'Your cart is empty'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {language === 'de'
                ? 'Fügen Sie Produkte hinzu, um fortzufahren'
                : 'Add products to continue'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">
                {items.length} {language === 'de' ? 'Artikel' : 'items'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={clearCart}
              >
                {language === 'de' ? 'Alle entfernen' : 'Clear all'}
              </Button>
            </div>

            <ScrollArea className="flex-1 -mx-6 px-6">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </ScrollArea>

            <CartSummary onCheckout={() => setOpen(false)} />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
