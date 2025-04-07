import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart,
  Line
} from 'recharts';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { StatsCard, StatsRow } from '@/components/ui/stats';
import { 
  ChevronDown, 
  Loader2,
  ShoppingBag,
  DollarSign,
  Clock,
  Users
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Daily sales data for the chart
const getDailyData = () => [
  { name: 'Mon', orders: 45, revenue: 1280 },
  { name: 'Tue', orders: 52, revenue: 1580 },
  { name: 'Wed', orders: 49, revenue: 1620 },
  { name: 'Thu', orders: 55, revenue: 1700 },
  { name: 'Fri', orders: 71, revenue: 2200 },
  { name: 'Sat', orders: 87, revenue: 2750 },
  { name: 'Sun', orders: 64, revenue: 1950 }
];

// Weekly sales data for the chart
const getWeeklyData = () => [
  { name: 'Week 1', orders: 320, revenue: 9500 },
  { name: 'Week 2', orders: 352, revenue: 10200 },
  { name: 'Week 3', orders: 384, revenue: 11400 },
  { name: 'Week 4', orders: 420, revenue: 12800 }
];

// Monthly sales data for the chart
const getMonthlyData = () => [
  { name: 'Jan', orders: 1250, revenue: 38500 },
  { name: 'Feb', orders: 1380, revenue: 42000 },
  { name: 'Mar', orders: 1520, revenue: 46300 },
  { name: 'Apr', orders: 1600, revenue: 49000 },
  { name: 'May', orders: 1420, revenue: 43500 },
  { name: 'Jun', orders: 1680, revenue: 51200 }
];

export default function SalesSummary() {
  const [period, setPeriod] = useState('week');
  const [chartType, setChartType] = useState('orders');
  
  const { data: orders = [], isLoading: ordersLoading } = useQuery({ 
    queryKey: ['/api/orders']
  });
  
  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    );
  }
  
  // Calculate the total orders, revenue, average time, and active customers
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0) / 100; // Convert cents to dollars
  
  const getChartData = () => {
    switch(period) {
      case 'day':
        return getDailyData();
      case 'week':
        return getWeeklyData();
      case 'month':
        return getMonthlyData();
      default:
        return getDailyData();
    }
  };
  
  const chartData = getChartData();
  
  return (
    <div className="space-y-6">
      <StatsRow>
        <StatsCard
          title="Total Orders"
          value={totalOrders.toString()}
          icon={<ShoppingBag className="h-4 w-4 text-accent-blue" />}
          change={12.5}
          progress={80}
          progressColor="bg-accent-blue"
        />
        
        <StatsCard
          title="Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="h-4 w-4 text-accent-green" />}
          change={8.3}
          progress={65}
          progressColor="bg-accent-green"
        />
        
        <StatsCard
          title="Avg. Delivery Time"
          value="24 min"
          icon={<Clock className="h-4 w-4 text-accent-yellow" />}
          change={-5.2}
          progress={40}
          progressColor="bg-accent-yellow"
        />
        
        <StatsCard
          title="Active Customers"
          value="423"
          icon={<Users className="h-4 w-4 text-accent-purple" />}
          change={15.7}
          progress={70}
          progressColor="bg-accent-purple"
        />
      </StatsRow>
      
      <DashboardCard 
        title="Sales Overview"
        headerAction={
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[120px] h-8 text-sm bg-bg-chart border-border-color">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="bg-bg-card border-border-color">
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      >
        <Tabs defaultValue="orders" className="w-full" onValueChange={setChartType}>
          <TabsList className="mb-4 bg-bg-chart">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: 'var(--border-color)' }} 
                  tick={{ fill: 'var(--text-secondary)' }}
                />
                <YAxis 
                  axisLine={{ stroke: 'var(--border-color)' }} 
                  tick={{ fill: 'var(--text-secondary)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-card)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar 
                  dataKey="orders" 
                  fill="var(--accent-blue)" 
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="revenue" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: 'var(--border-color)' }} 
                  tick={{ fill: 'var(--text-secondary)' }}
                />
                <YAxis 
                  axisLine={{ stroke: 'var(--border-color)' }} 
                  tick={{ fill: 'var(--text-secondary)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-card)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--accent-green)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--accent-green)', r: 4 }}
                  activeDot={{ r: 6, fill: 'var(--accent-green)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </DashboardCard>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard title="Top-Selling Items">
          <div className="space-y-4">
            {[
              { name: 'Cheeseburger Deluxe', amount: '$3,240', percentage: 15 },
              { name: 'Chicken Wings', amount: '$2,860', percentage: 12 },
              { name: 'Margherita Pizza', amount: '$2,150', percentage: 9 },
              { name: 'Caesar Salad', amount: '$1,720', percentage: 7 },
              { name: 'French Fries', amount: '$1,540', percentage: 6 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-blue/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-accent-blue">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-text-secondary">{item.amount}</p>
                  </div>
                </div>
                <div className="w-20 h-2 bg-bg-dark rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent-blue rounded-full" 
                    style={{ width: `${item.percentage * 5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
        
        <DashboardCard title="Order Sources">
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={[
                  { name: 'Website', value: 40 },
                  { name: 'DoorDash', value: 28 },
                  { name: 'UberEats', value: 22 },
                  { name: 'Grubhub', value: 18 },
                  { name: 'Phone', value: 12 }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                <XAxis 
                  type="number" 
                  axisLine={{ stroke: 'var(--border-color)' }} 
                  tick={{ fill: 'var(--text-secondary)' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={{ stroke: 'var(--border-color)' }} 
                  tick={{ fill: 'var(--text-secondary)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-card)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                  formatter={(value) => [`${value}%`, 'Percentage']}
                />
                <Bar 
                  dataKey="value" 
                  fill="var(--accent-purple)" 
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
