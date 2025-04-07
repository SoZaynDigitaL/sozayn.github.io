import { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingBag 
} from 'lucide-react';

import { DashboardCard } from '@/components/ui/dashboard-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

// Demo data
const weeklyData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3200 },
  { name: 'Wed', sales: 5600 },
  { name: 'Thu', sales: 4800 },
  { name: 'Fri', sales: 5900 },
  { name: 'Sat', sales: 7800 },
  { name: 'Sun', sales: 6800 },
];

const monthlyData = [
  { name: 'Jan', sales: 25000 },
  { name: 'Feb', sales: 29000 },
  { name: 'Mar', sales: 32000 },
  { name: 'Apr', sales: 35000 },
  { name: 'May', sales: 38000 },
  { name: 'Jun', sales: 42000 },
  { name: 'Jul', sales: 45000 },
  { name: 'Aug', sales: 48000 },
  { name: 'Sep', sales: 52000 },
  { name: 'Oct', sales: 55000 },
  { name: 'Nov', sales: 58000 },
  { name: 'Dec', sales: 62000 },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-bg-card border border-border-color rounded-md shadow">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-accent-blue">
          ${(payload[0].value as number).toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
};

export default function SalesSummary() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const isMobile = useIsMobile();

  const summaryCards = [
    {
      title: 'Total Revenue',
      value: '$128,430',
      change: '+12.2%',
      positive: true,
      icon: <DollarSign className="h-5 w-5 text-accent-blue" />,
      iconBg: 'bg-accent-blue/10'
    },
    {
      title: 'Orders',
      value: '4,385',
      change: '+8.1%',
      positive: true,
      icon: <ShoppingBag className="h-5 w-5 text-accent-green" />,
      iconBg: 'bg-accent-green/10'
    },
    {
      title: 'Customers',
      value: '12,749',
      change: '+5.3%',
      positive: true,
      icon: <Users className="h-5 w-5 text-accent-purple" />,
      iconBg: 'bg-accent-purple/10'
    },
    {
      title: 'Growth Rate',
      value: '23.8%',
      change: '-2.5%',
      positive: false,
      icon: <TrendingUp className="h-5 w-5 text-accent-orange" />,
      iconBg: 'bg-accent-orange/10'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Summary Cards */}
      {summaryCards.map((card, index) => (
        <DashboardCard
          key={index}
          title={card.title}
          className="bg-bg-card"
        >
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold">{card.value}</h3>
                <div className="flex items-center mt-1">
                  <span className={`flex items-center text-xs ${card.positive ? 'text-accent-green' : 'text-destructive'}`}>
                    {card.positive ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {card.change}
                  </span>
                  <span className="text-xs text-text-secondary ml-1">vs last period</span>
                </div>
              </div>
              <div className={`p-2 rounded-md ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>
          </div>
        </DashboardCard>
      ))}

      {/* Sales Chart */}
      <DashboardCard
        title="Sales Overview"
        description="Your business performance"
        className="col-span-1 md:col-span-4"
      >
        <div className="pt-4 pl-2 pr-6 pb-4">
          <Tabs defaultValue="weekly" className="w-full" onValueChange={(value) => setPeriod(value as 'weekly' | 'monthly')}>
            <div className="flex justify-between items-center px-4 mb-4">
              <h3 className="text-sm font-medium">Performance</h3>
              <TabsList className="bg-bg-chart">
                <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="weekly" className="m-0">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyData}
                    margin={isMobile ? { top: 5, right: 0, left: 0, bottom: 5 } : { top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="sales" 
                      fill="#4361ee" 
                      radius={[4, 4, 0, 0]}
                      barSize={isMobile ? 20 : 40} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="m-0">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={isMobile ? { top: 5, right: 0, left: 0, bottom: 5 } : { top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="sales" 
                      fill="#4361ee" 
                      radius={[4, 4, 0, 0]}
                      barSize={isMobile ? 15 : 30} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardCard>
    </div>
  );
}