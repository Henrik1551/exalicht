import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, MoreHorizontal } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { formatPrice, getStatusLabel, getStatusColor } from '@/lib/order-utils';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: string;
  total: number;
  created_at: string;
}

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export function OrdersTable() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

      toast({
        title: language === 'de' ? 'Status aktualisiert' : 'Status updated',
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        variant: 'destructive',
      });
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={language === 'de' ? 'Status filtern' : 'Filter by status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {language === 'de' ? 'Alle Status' : 'All statuses'}
            </SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status, language)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{language === 'de' ? 'Bestellnr.' : 'Order #'}</TableHead>
              <TableHead>{language === 'de' ? 'Kunde' : 'Customer'}</TableHead>
              <TableHead>{language === 'de' ? 'Status' : 'Status'}</TableHead>
              <TableHead>{language === 'de' ? 'Gesamt' : 'Total'}</TableHead>
              <TableHead>{language === 'de' ? 'Datum' : 'Date'}</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {language === 'de' ? 'Keine Bestellungen gefunden' : 'No orders found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status, language)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatPrice(order.total, language)}</TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString(
                      language === 'de' ? 'de-DE' : 'en-US'
                    )}
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
                          <Link to={`/admin/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            {language === 'de' ? 'Details' : 'View Details'}
                          </Link>
                        </DropdownMenuItem>
                        {statuses.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => updateStatus(order.id, status)}
                            disabled={order.status === status}
                          >
                            {language === 'de' ? 'Status: ' : 'Set: '}
                            {getStatusLabel(status, language)}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
