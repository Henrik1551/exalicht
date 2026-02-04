import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, MoreHorizontal, Trash2, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/order-utils';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { ProductEditDialog } from './ProductEditDialog';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number | null;
  in_stock: boolean | null;
  category: string | null;
  images: string[] | null;
  short_description?: string | null;
  description?: string | null;
  weight_kg?: number | null;
  gtin?: string | null;
  is_featured?: boolean | null;
}

export function ProductsTable() {
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, price, in_stock, category, images, short_description, description, weight_kg, gtin, is_featured')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setEditDialogOpen(true);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) throw error;

      toast.success(
        language === 'de'
          ? `"${productToDelete.name}" wurde gelöscht`
          : `"${productToDelete.name}" has been deleted`
      );
      setProducts(products.filter((p) => p.id !== productToDelete.id));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(
        language === 'de'
          ? 'Fehler beim Löschen des Produkts'
          : 'Failed to delete product'
      );
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'de' ? 'Produkte suchen...' : 'Search products...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">{language === 'de' ? 'Bild' : 'Image'}</TableHead>
              <TableHead>{language === 'de' ? 'Name' : 'Name'}</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>{language === 'de' ? 'Preis' : 'Price'}</TableHead>
              <TableHead>{language === 'de' ? 'Status' : 'Status'}</TableHead>
              <TableHead>{language === 'de' ? 'Kategorie' : 'Category'}</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {language === 'de' ? 'Keine Produkte gefunden' : 'No products found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          -
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/products/${product.id}`}
                      className="font-medium hover:underline"
                    >
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.sku || '-'}
                  </TableCell>
                  <TableCell>
                    {product.price ? formatPrice(product.price, language) : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.in_stock ? 'default' : 'secondary'}>
                      {product.in_stock
                        ? language === 'de'
                          ? 'Auf Lager'
                          : 'In Stock'
                        : language === 'de'
                        ? 'Nicht verfügbar'
                        : 'Out of Stock'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.category || '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/products/${product.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            {language === 'de' ? 'Ansehen' : 'View'}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {language === 'de' ? 'Bearbeiten' : 'Edit'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {language === 'de' ? 'Löschen' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'de' ? 'Produkt löschen?' : 'Delete product?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'de'
                ? `Sind Sie sicher, dass Sie "${productToDelete?.name}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`
                : `Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {language === 'de' ? 'Abbrechen' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {language === 'de' ? 'Löschen' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <ProductEditDialog
        product={productToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onProductUpdated={fetchProducts}
      />
    </div>
  );
}
