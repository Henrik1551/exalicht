import { useEffect, useState } from 'react';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { formatPrice } from '@/lib/order-utils';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
}

export function StatsCards() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch products count
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsCount = productsSnapshot.size;

        // Fetch orders stats
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const orders = ordersSnapshot.docs.map(d => d.data() as { status: string; total: number });

        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

        setStats({
          totalOrders,
          pendingOrders,
          totalRevenue,
          totalProducts: productsCount,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: language === 'de' ? 'Gesamtbestellungen' : 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      description: language === 'de' ? 'Alle Bestellungen' : 'All orders',
    },
    {
      title: language === 'de' ? 'Ausstehend' : 'Pending',
      value: stats.pendingOrders,
      icon: TrendingUp,
      description: language === 'de' ? 'Zu bearbeiten' : 'To process',
    },
    {
      title: language === 'de' ? 'Umsatz' : 'Revenue',
      value: formatPrice(stats.totalRevenue, language),
      icon: DollarSign,
      description: language === 'de' ? 'Gesamtumsatz (Brutto)' : 'Total revenue (gross)',
    },
    {
      title: language === 'de' ? 'Produkte' : 'Products',
      value: stats.totalProducts,
      icon: Package,
      description: language === 'de' ? 'Im Katalog' : 'In catalog',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : card.value}
            </div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
