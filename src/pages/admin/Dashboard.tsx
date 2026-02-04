import { Link } from 'react-router-dom';
import { ShoppingCart, Package, ArrowRight } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCards } from '@/components/admin/StatsCards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminDashboard() {
  const { language } = useLanguage();

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'de' ? 'Admin Dashboard' : 'Admin Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'de'
              ? 'Übersicht über Ihre Bestellungen und Produkte'
              : 'Overview of your orders and products'}
          </p>
        </div>

        <StatsCards />

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {language === 'de' ? 'Bestellungen' : 'Orders'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {language === 'de'
                  ? 'Verwalten Sie Kundenbestellungen und aktualisieren Sie den Status.'
                  : 'Manage customer orders and update their status.'}
              </p>
              <Button asChild>
                <Link to="/admin/orders" className="gap-2">
                  {language === 'de' ? 'Bestellungen anzeigen' : 'View Orders'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {language === 'de' ? 'Produkte' : 'Products'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {language === 'de'
                  ? 'Verwalten Sie Ihren Produktkatalog und Lagerbestand.'
                  : 'Manage your product catalog and inventory.'}
              </p>
              <Button asChild>
                <Link to="/admin/products" className="gap-2">
                  {language === 'de' ? 'Produkte verwalten' : 'Manage Products'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
