import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import SalesSummary from '@/components/dashboard/SalesSummary';
import { Button } from '@/components/ui/button';
import { OrderTracking } from '@/components/ui/order-tracking';
import { 
  DashboardCard 
} from '@/components/ui/dashboard-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowRight, 
  Loader2, 
  Clock,
  Package,
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Get recent orders
  const { 
    data: recentOrders = [] as any[], 
    isLoading: ordersLoading 
  } = useQuery<any[]>({
    queryKey: ['/api/orders/recent'],
    enabled: !!user,
  });

  // Get integrations
  const { 
    data: integrations = [] as any[],
    isLoading: integrationsLoading
  } = useQuery<any[]>({
    queryKey: ['/api/integrations'],
    enabled: !!user,
  });

  // Get clients
  const { 
    data: clients = [] as any[],
    isLoading: clientsLoading
  } = useQuery<any[]>({
    queryKey: ['/api/clients'],
    enabled: !!user,
  });

  // Generate demo data mutation
  const generateDemoData = useMutation({
    mutationFn: () => {
      return apiRequest('POST', '/api/demo/generate', {});
    },
    onSuccess: () => {
      toast({
        title: "Demo data generated",
        description: "Sample data has been added to your account",
      });
      // Invalidate all queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate demo data",
        variant: "destructive",
      });
    }
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // Function to get the status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-blue-500/20 text-blue-500';
      case 'prepared':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'picked_up':
        return 'bg-orange-500/20 text-orange-500';
      case 'in_transit':
        return 'bg-purple-500/20 text-purple-500';
      case 'delivered':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome, SoZayn Admin</h1>
            <p className="text-text-secondary">
              Here's what's happening with your restaurant network today
            </p>
          </div>
          
          {recentOrders.length === 0 && !ordersLoading && (
            <Button 
              onClick={() => generateDemoData.mutate()}
              disabled={generateDemoData.isPending}
              className="bg-accent-blue hover:bg-accent-blue/90"
            >
              {generateDemoData.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Demo Data'
              )}
            </Button>
          )}
        </div>

        {/* Sales summary section */}
        <SalesSummary />

        {/* Recent orders and clients grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent orders */}
          <DashboardCard 
            title="Recent Orders" 
            description="Latest orders across all client restaurants"
            headerAction={
              <Button variant="link" className="text-accent-blue" onClick={() => window.location.href = '/dashboard/orders'}>
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            }
          >
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <Package className="h-12 w-12 mx-auto text-text-secondary opacity-50" />
                <p className="text-text-secondary">No orders yet</p>
                <Button 
                  onClick={() => generateDemoData.mutate()} 
                  variant="outline"
                  disabled={generateDemoData.isPending}
                >
                  {generateDemoData.isPending ? 'Generating...' : 'Generate Sample Orders'}
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order: any) => (
                    <TableRow key={order.id} className="cursor-pointer" onClick={() => window.location.href = '/dashboard/orders'}>
                      <TableCell className="font-medium">
                        #{order.orderNumber}
                        <div className="text-xs text-text-secondary flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(order.createdAt), 'MMM d, h:mm a')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-bg-chart">
                          {order.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DashboardCard>

          {/* Client list */}
          <DashboardCard 
            title="Clients" 
            description="Your restaurant and grocery clients"
            headerAction={
              <Button variant="link" className="text-accent-blue" onClick={() => window.location.href = '/dashboard/clients'}>
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            }
          >
            {clientsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
              </div>
            ) : (clients?.length || 0) === 0 ? (
              <div className="text-center py-8 space-y-4">
                <Users className="h-12 w-12 mx-auto text-text-secondary opacity-50" />
                <p className="text-text-secondary">No clients yet</p>
                <Button 
                  onClick={() => window.location.href = '/dashboard/clients'} 
                  variant="outline"
                >
                  Manage Clients
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {clients.slice(0, 5).map((client: any) => (
                  <div 
                    key={client.id} 
                    className="p-4 border border-border-color rounded-lg bg-bg-chart/50 flex items-center justify-between cursor-pointer"
                    onClick={() => window.location.href = `/dashboard/clients/${client.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center">
                        <span className="font-bold text-sm">
                          {client.businessName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{client.businessName}</p>
                        <p className="text-xs text-text-secondary">{client.businessType}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={client.isActive ? "bg-accent-green/10 text-accent-green border-accent-green/20" : "bg-destructive/10 text-destructive border-destructive/20"}>
                      {client.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Order flow visualization */}
        <DashboardCard title="Platform Overview">
          <div className="my-4">
            <OrderTracking currentStatus="in_transit" />
          </div>
          <p className="text-center text-text-secondary text-sm mt-4">
            Track how orders move through your network from receipt to delivery
          </p>
        </DashboardCard>
      </div>
    </AdminDashboardLayout>
  );
}