import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { OrderTracking } from '@/components/ui/order-tracking';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Printer, 
  MoreVertical, 
  Calendar, 
  Clock, 
  Phone, 
  MapPin, 
  Filter, 
  Search,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type OrderStatus = 'received' | 'prepared' | 'picked_up' | 'in_transit' | 'delivered';

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

export default function OrdersList() {
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const { toast } = useToast();
  
  const { data: orders = [], isLoading } = useQuery({ 
    queryKey: ['/api/orders'],
  });
  
  const { data: selectedOrderData } = useQuery({
    queryKey: ['/api/orders', selectedOrder],
    enabled: !!selectedOrder,
    queryFn: async ({ queryKey }) => {
      const orderId = queryKey[1];
      // Filter the orders to find the selected one
      // In a real app, you'd make an API call if needed
      return orders.find((order: any) => order.id === orderId);
    }
  });
  
  const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
      await apiRequest('PATCH', `/api/orders/${orderId}/status`, { status });
      
      // Invalidate orders cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders', orderId] });
      
      toast({
        title: "Order updated",
        description: `Order status changed to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error updating order",
        description: "There was a problem updating the order status",
        variant: "destructive",
      });
    }
  };
  
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-text-secondary pointer-events-none" />
            <Input 
              placeholder="Search orders..." 
              className="pl-8 bg-bg-card border-border-color" 
            />
          </div>
          
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3">
          <DashboardCard>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any) => (
                  <TableRow 
                    key={order.id} 
                    className={`cursor-pointer ${order.id === selectedOrder ? 'bg-bg-chart' : ''}`}
                    onClick={() => setSelectedOrder(order.id)}
                  >
                    <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'dd MMM yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-bg-chart">
                        {order.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-bg-card border-border-color">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'prepared');
                            }}
                          >
                            Mark as Prepared
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'picked_up');
                            }}
                          >
                            Mark as Picked Up
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'in_transit');
                            }}
                          >
                            Mark as In Transit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(order.id, 'delivered');
                            }}
                          >
                            Mark as Delivered
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Print receipt');
                            }}
                          >
                            Print Receipt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DashboardCard>
        </div>
        
        <div className="lg:w-1/3">
          {selectedOrderData ? (
            <Card className="bg-bg-card border-border-color p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">Order #{selectedOrderData.orderNumber}</h3>
                  <div className="flex items-center gap-2 text-text-secondary text-sm mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(selectedOrderData.createdAt), 'dd MMM yyyy')}
                    <Clock className="h-3.5 w-3.5 ml-2" />
                    {format(new Date(selectedOrderData.createdAt), 'h:mm a')}
                  </div>
                </div>
                <Button variant="outline" size="icon">
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
              
              <OrderTracking currentStatus={selectedOrderData.status} />
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Customer Details</h4>
                <div className="bg-bg-chart rounded-lg p-3">
                  <p className="text-sm font-medium mb-1">{selectedOrderData.customerName}</p>
                  <div className="flex items-center gap-2 text-text-secondary text-xs mb-1">
                    <Phone className="h-3 w-3" />
                    555-123-4567
                  </div>
                  <div className="flex items-start gap-2 text-text-secondary text-xs">
                    <MapPin className="h-3 w-3 mt-0.5" />
                    <span>{selectedOrderData.customerAddress}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrderData.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm border-b border-border-color pb-2">
                      <div>
                        <span className="font-medium">{item.quantity}x</span> {item.name}
                      </div>
                      <div className="font-medium">{formatCurrency(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-text-secondary text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrderData.totalAmount - (selectedOrderData.deliveryFee || 0))}</span>
                </div>
                <div className="flex justify-between text-text-secondary text-sm">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(selectedOrderData.deliveryFee || 0)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrderData.totalAmount)}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">Delivery Method</h4>
                <Badge className="bg-accent-blue/20 text-accent-blue text-xs px-2 py-1">
                  {selectedOrderData.deliveryPartner}
                </Badge>
              </div>
            </Card>
          ) : (
            <Card className="bg-bg-card border-border-color p-6 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-text-secondary mb-2">Select an order to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
