import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminProducts() {
  const { language } = useLanguage();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'de' ? 'Produkte' : 'Products'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'de'
              ? 'Verwalten Sie Ihren Produktkatalog'
              : 'Manage your product catalog'}
          </p>
        </div>

        <ProductsTable />
      </div>
    </AdminLayout>
  );
}
