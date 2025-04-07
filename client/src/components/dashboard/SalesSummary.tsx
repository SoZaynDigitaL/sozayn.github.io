import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { OrdersChart, RevenueChart, CustomersChart } from './Charts';
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  BarChart3 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getOrderAnalytics, 
  getRevenueAnalytics,
  getCustomerAnalytics,
  getOrdersData,
  getCustomersData
} from '@/lib/dashboardData';

function SummaryCard({ 
  title, 
  value, 
  trend, 
  trendValue, 
  icon, 
  trendText,
  iconBackground 
}: { 
  title: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  icon: React.ReactNode;
  trendText?: string;
  iconBackground?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            
            <div className="flex items-center mt-2">
              {trend === 'up' && (
                <ArrowUpIcon className="h-4 w-4 text-accent-green mr-1" />
              )}
              {trend === 'down' && (
                <ArrowDownIcon className="h-4 w-4 text-accent-orange mr-1" />
              )}
              <span
                className={cn("text-xs font-medium", {
                  "text-accent-green": trend === 'up',
                  "text-accent-orange": trend === 'down',
                  "text-text-secondary": trend === 'neutral'
                })}
              >
                {trendValue} {trendText || 'vs. last period'}
              </span>
            </div>
          </div>
          
          <div className={cn(
            "p-3 rounded-full", 
            iconBackground || "bg-accent-blue/20"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

export default function SalesSummary() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [orderStats, setOrderStats] = useState({
    total: 0,
    trend: 'up' as const,
    trendValue: '12%'
  });
  const [revenueStats, setRevenueStats] = useState({
    total: 0,
    trend: 'up' as const,
    trendValue: '18%'
  });
  const [customerStats, setCustomerStats] = useState({
    total: 0,
    trend: 'up' as const,
    trendValue: '5%'
  });
  const [chartData, setChartData] = useState<{
    orders: { labels: string[], values: number[] },
    revenue: { labels: string[], values: number[] },
    customers: { labels: string[], values: number[] }
  }>({
    orders: { labels: [], values: [] },
    revenue: { labels: [], values: [] },
    customers: { labels: [], values: [] }
  });
  
  useEffect(() => {
    // Load statistics
    const orders = getOrdersData();
    const customers = getCustomersData();
    const orderAnalytics = getOrderAnalytics();
    const revenueAnalytics = getRevenueAnalytics();
    const customerAnalytics = getCustomerAnalytics();
    
    // Set statistics data
    setOrderStats({
      total: orders.length,
      trend: 'up',
      trendValue: '12%'
    });
    
    setRevenueStats({
      total: orders.reduce((sum, order) => sum + order.totalAmount, 0) / 100, // Convert cents to dollars
      trend: 'up',
      trendValue: '18%'
    });
    
    setCustomerStats({
      total: customers.length,
      trend: 'up',
      trendValue: '5%'
    });
    
    // Set chart data
    setChartData({
      orders: orderAnalytics.weeklyData,
      revenue: revenueAnalytics.monthlyData,
      customers: customerAnalytics.tierData
    });
  }, [period]);
  
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Total Orders"
          value={orderStats.total.toString()}
          trend={orderStats.trend}
          trendValue={orderStats.trendValue}
          icon={<ShoppingBag className="h-5 w-5 text-accent-blue" />}
          iconBackground="bg-accent-blue/20"
        />
        
        <SummaryCard 
          title="Total Revenue"
          value={formatCurrency(revenueStats.total)}
          trend={revenueStats.trend}
          trendValue={revenueStats.trendValue}
          icon={<DollarSign className="h-5 w-5 text-accent-green" />}
          iconBackground="bg-accent-green/20"
        />
        
        <SummaryCard 
          title="Active Customers"
          value={customerStats.total.toString()}
          trend={customerStats.trend}
          trendValue={customerStats.trendValue}
          icon={<Users className="h-5 w-5 text-accent-purple" />}
          iconBackground="bg-accent-purple/20"
        />
      </div>
      
      {/* Analytics graph */}
      <DashboardCard 
        title="Performance Analytics" 
        description="Monitor your business metrics over time"
        headerAction={
          <Tabs defaultValue={period} onValueChange={(v) => setPeriod(v as any)}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      >
        <div className="pt-4">
          <Tabs defaultValue="orders">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="customers">Customer Segments</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="h-[300px]">
              <OrdersChart data={chartData.orders} />
            </TabsContent>
            <TabsContent value="revenue" className="h-[300px]">
              <RevenueChart data={chartData.revenue} />
            </TabsContent>
            <TabsContent value="customers" className="h-[300px]">
              <CustomersChart data={chartData.customers} />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardCard>
    </div>
  );
}