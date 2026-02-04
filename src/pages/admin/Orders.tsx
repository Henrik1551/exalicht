import { AdminLayout } from '@/components/admin/AdminLayout';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminOrders() {
  const { language } = useLanguage();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'de' ? 'Bestellungen' : 'Orders'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'de'
              ? 'Verwalten Sie alle Kundenbestellungen'
              : 'Manage all customer orders'}
          </p>
        </div>

        <OrdersTable />
      </div>
    </AdminLayout>
  );
}
