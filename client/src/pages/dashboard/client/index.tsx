import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import ClientDashboardLayout from '@/components/layout/ClientDashboardLayout';
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
  ShoppingBag,
  BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function ClientDashboard() {
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
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.businessName}</h1>
            <p className="text-text-secondary">
              Here's what's happening with your restaurant today
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

        {/* Recent orders and top items grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent orders */}
          <DashboardCard 
            title="Recent Orders" 
            description="Your latest customer orders"
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

          {/* Top-Selling Items */}
          <DashboardCard 
            title="Top-Selling Items" 
            description="Your most popular menu items"
            headerAction={
              <Button variant="link" className="text-accent-blue" onClick={() => window.location.href = '/dashboard/menu'}>
                View Menu
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            }
          >
            <div className="space-y-4 py-2">
              {/* Example Top Selling Items */}
              <div className="flex items-center justify-between p-3 border border-border-color rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-blue/10 rounded-md flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-accent-blue" />
                  </div>
                  <div>
                    <p className="font-medium">Cheeseburger Deluxe</p>
                    <p className="text-xs text-text-secondary">$12.99</p>
                  </div>
                </div>
                <div className="bg-accent-green/10 text-accent-green px-2 py-1 rounded-full text-xs font-medium">
                  328 orders
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-border-color rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-purple/10 rounded-md flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-accent-purple" />
                  </div>
                  <div>
                    <p className="font-medium">Chicken Wings</p>
                    <p className="text-xs text-text-secondary">$10.99</p>
                  </div>
                </div>
                <div className="bg-accent-green/10 text-accent-green px-2 py-1 rounded-full text-xs font-medium">
                  256 orders
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-border-color rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-orange/10 rounded-md flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-accent-orange" />
                  </div>
                  <div>
                    <p className="font-medium">Caesar Salad</p>
                    <p className="text-xs text-text-secondary">$8.99</p>
                  </div>
                </div>
                <div className="bg-accent-green/10 text-accent-green px-2 py-1 rounded-full text-xs font-medium">
                  194 orders
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-border-color rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-blue/10 rounded-md flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-accent-blue" />
                  </div>
                  <div>
                    <p className="font-medium">French Fries</p>
                    <p className="text-xs text-text-secondary">$4.99</p>
                  </div>
                </div>
                <div className="bg-accent-green/10 text-accent-green px-2 py-1 rounded-full text-xs font-medium">
                  187 orders
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Order Sources */}
        <DashboardCard title="Order Sources" description="Where your orders are coming from">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Website</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="h-2 bg-bg-chart rounded-full overflow-hidden">
                <div className="h-full bg-accent-blue rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">DoorDash</span>
                <span className="text-sm font-medium">25%</span>
              </div>
              <div className="h-2 bg-bg-chart rounded-full overflow-hidden">
                <div className="h-full bg-accent-orange rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">UberEats</span>
                <span className="text-sm font-medium">20%</span>
              </div>
              <div className="h-2 bg-bg-chart rounded-full overflow-hidden">
                <div className="h-full bg-accent-green rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Other</span>
                <span className="text-sm font-medium">10%</span>
              </div>
              <div className="h-2 bg-bg-chart rounded-full overflow-hidden">
                <div className="h-full bg-accent-purple rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              className="bg-bg-chart"
              onClick={() => window.location.href = '/dashboard/insights'}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View Detailed Analytics
            </Button>
          </div>
        </DashboardCard>
      </div>
    </ClientDashboardLayout>
  );
}