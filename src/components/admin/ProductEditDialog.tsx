import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number | null;
  in_stock: boolean | null;
  category: string | null;
  short_description?: string | null;
  description?: string | null;
  images?: string[] | null;
  weight_kg?: number | null;
  gtin?: string | null;
  is_featured?: boolean | null;
  stock_quantity?: number | null;
}

interface ProductEditDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdated: () => void;
}

export function ProductEditDialog({
  product,
  open,
  onOpenChange,
  onProductUpdated,
}: ProductEditDialogProps) {
  const { language } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    category: '',
    short_description: '',
    description: '',
    weight_kg: '',
    gtin: '',
    stock_quantity: '',
    in_stock: true,
    is_featured: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        short_description: product.short_description || '',
        description: product.description || '',
        weight_kg: product.weight_kg?.toString() || '',
        gtin: product.gtin || '',
        stock_quantity: product.stock_quantity?.toString() || '',
        in_stock: product.in_stock ?? true,
        is_featured: product.is_featured ?? false,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          sku: formData.sku || null,
          price: formData.price ? parseFloat(formData.price) : null,
          category: formData.category || null,
          short_description: formData.short_description || null,
          description: formData.description || null,
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
          gtin: formData.gtin || null,
          stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity, 10) : null,
          in_stock: formData.in_stock,
          is_featured: formData.is_featured,
        })
        .eq('id', product.id);

      if (error) throw error;

      toast.success(
        language === 'de'
          ? 'Produkt erfolgreich aktualisiert'
          : 'Product updated successfully'
      );
      onProductUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(
        language === 'de'
          ? 'Fehler beim Aktualisieren des Produkts'
          : 'Failed to update product'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'de' ? 'Produkt bearbeiten' : 'Edit Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{language === 'de' ? 'Name' : 'Name'} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* SKU & Price Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">{language === 'de' ? 'Preis (€)' : 'Price (€)'}</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">
                {language === 'de' ? 'Lagerbestand' : 'Stock Quantity'}
              </Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0"
                step="1"
                placeholder={language === 'de' ? 'Nicht verfolgt' : 'Not tracked'}
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, stock_quantity: e.target.value })
                }
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">{language === 'de' ? 'Kategorie' : 'Category'}</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <Label htmlFor="short_description">
              {language === 'de' ? 'Kurzbeschreibung' : 'Short Description'}
            </Label>
            <Textarea
              id="short_description"
              rows={2}
              value={formData.short_description}
              onChange={(e) =>
                setFormData({ ...formData, short_description: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {language === 'de' ? 'Beschreibung' : 'Description'}
            </Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Weight & GTIN Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight_kg">
                {language === 'de' ? 'Gewicht (kg)' : 'Weight (kg)'}
              </Label>
              <Input
                id="weight_kg"
                type="number"
                step="0.001"
                min="0"
                value={formData.weight_kg}
                onChange={(e) =>
                  setFormData({ ...formData, weight_kg: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gtin">GTIN/EAN</Label>
              <Input
                id="gtin"
                value={formData.gtin}
                onChange={(e) => setFormData({ ...formData, gtin: e.target.value })}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-8 pt-2">
            <div className="flex items-center gap-2">
              <Switch
                id="in_stock"
                checked={formData.in_stock}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, in_stock: checked })
                }
              />
              <Label htmlFor="in_stock">
                {language === 'de' ? 'Auf Lager' : 'In Stock'}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_featured: checked })
                }
              />
              <Label htmlFor="is_featured">
                {language === 'de' ? 'Hervorgehoben' : 'Featured'}
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              {language === 'de' ? 'Abbrechen' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {language === 'de' ? 'Speichern' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
