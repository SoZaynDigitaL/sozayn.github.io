import DashboardLayout from '@/components/layout/DashboardLayout';
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatsCard } from '@/components/ui/stats';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Mail,
  TrendingUp,
  Search,
  Users,
  Calendar,
  MessageSquare,
  BarChart2,
  MousePointer,
  Globe,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Hash,
  PlusCircle,
  ChevronDown,
  ListFilter,
  Megaphone,
  RefreshCw,
  SendHorizonal,
  Clock,
  Target,
  Anchor
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation, Link } from 'wouter';

export default function MarketingPage() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  
  // Marketing metrics
  const marketingMetrics = {
    emailCampaigns: 42,
    emailOpenRate: 28.5,
    automatedCampaigns: 15,
    searchRanking: 12
  };
  
  // Campaign performance data
  const campaignData = [
    { name: 'Jan', emailOpens: 6500, clicks: 4200, conversions: 1800 },
    { name: 'Feb', emailOpens: 5900, clicks: 3800, conversions: 1650 },
    { name: 'Mar', emailOpens: 8800, clicks: 5600, conversions: 2400 },
    { name: 'Apr', emailOpens: 7800, clicks: 4900, conversions: 2100 },
    { name: 'May', emailOpens: 9200, clicks: 5800, conversions: 2500 },
    { name: 'Jun', emailOpens: 10500, clicks: 6700, conversions: 2900 }
  ];
  
  // Keyword performance data
  const keywordData = [
    { keyword: 'restaurant near me', position: 3, change: 2, volume: 22500, difficulty: 'High' },
    { keyword: 'best italian food', position: 5, change: -1, volume: 12300, difficulty: 'Medium' },
    { keyword: '[brand name] menu', position: 1, change: 0, volume: 9800, difficulty: 'Low' },
    { keyword: 'food delivery [city]', position: 4, change: 3, volume: 18700, difficulty: 'High' },
    { keyword: 'healthy lunch options', position: 8, change: 5, volume: 7500, difficulty: 'Medium' }
  ];
  
  // Recent email campaigns
  const emailCampaigns = [
    { id: 1, name: 'Summer Special Promotion', sent: '2023-06-15', opens: 3270, clicks: 1842, conversions: 328 },
    { id: 2, name: 'New Menu Launch', sent: '2023-05-28', opens: 4120, clicks: 2245, conversions: 412 },
    { id: 3, name: 'Customer Loyalty Program', sent: '2023-05-10', opens: 3890, clicks: 1953, conversions: 287 },
    { id: 4, name: 'Holiday Hours Announcement', sent: '2023-04-22', opens: 3560, clicks: 1120, conversions: 195 }
  ];
  
  // Recent automated campaigns
  const automatedCampaigns = [
    { id: 1, name: 'Welcome Series', status: 'active', triggers: 'New customer sign-up', messages: 3, conversions: 425 },
    { id: 2, name: 'Order Confirmation', status: 'active', triggers: 'Purchase complete', messages: 1, conversions: 840 },
    { id: 3, name: 'Abandoned Cart', status: 'active', triggers: 'Cart abandoned', messages: 2, conversions: 312 },
    { id: 4, name: 'Re-engagement', status: 'paused', triggers: '30 days inactivity', messages: 2, conversions: 186 }
  ];
  
  // Website traffic sources
  const trafficSources = [
    { name: 'Organic Search', value: 42 },
    { name: 'Direct', value: 28 },
    { name: 'Social Media', value: 18 },
    { name: 'Email', value: 12 }
  ];
  
  const COLORS = ['#4361ee', '#8957e5', '#2ea043', '#ff9f1c'];
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">Marketing Dashboard</h1>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/marketing/email">
              <Button variant="outline" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Email Campaigns</span>
              </Button>
            </Link>
            <Link href="/dashboard/marketing/seo">
              <Button variant="outline" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>SEO Management</span>
              </Button>
            </Link>
            <Link href="/dashboard/marketing/automated">
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span>Automated Marketing</span>
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Email Campaigns"
            value={marketingMetrics.emailCampaigns.toString()}
            icon={<Mail className="h-4 w-4 text-accent-blue" />}
            change={15.8}
            progress={75}
            progressColor="bg-accent-blue"
          />
          
          <StatsCard
            title="Email Open Rate"
            value={`${marketingMetrics.emailOpenRate}%`}
            icon={<Mail className="h-4 w-4 text-accent-purple" />}
            change={3.2}
            progress={65}
            progressColor="bg-accent-purple"
          />
          
          <StatsCard
            title="Automated Campaigns"
            value={marketingMetrics.automatedCampaigns.toString()}
            icon={<RefreshCw className="h-4 w-4 text-accent-green" />}
            change={8.5}
            progress={60}
            progressColor="bg-accent-green"
          />
          
          <StatsCard
            title="Top Search Ranking"
            value={`#${marketingMetrics.searchRanking}`}
            icon={<Search className="h-4 w-4 text-accent-orange" />}
            change={-3.5}
            progress={40}
            progressColor="bg-accent-orange"
            isNegative={true}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <DashboardCard title="Campaign Performance" className="h-full">
              <div className="flex justify-end mb-4">
                <Select defaultValue="6m">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">Last Month</SelectItem>
                    <SelectItem value="3m">Last 3 Months</SelectItem>
                    <SelectItem value="6m">Last 6 Months</SelectItem>
                    <SelectItem value="1y">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={campaignData}>
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
                    <Legend />
                    <Line type="monotone" dataKey="emailOpens" stroke="var(--accent-blue)" name="Email Opens" />
                    <Line type="monotone" dataKey="clicks" stroke="var(--accent-purple)" name="Clicks" />
                    <Line type="monotone" dataKey="conversions" stroke="var(--accent-green)" name="Conversions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
          </div>
          
          <DashboardCard title="Traffic Sources" className="h-full">
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-card)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                    formatter={(value) => [`${value}%`, 'Percentage']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <DashboardCard title="Recent Email Campaigns">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead>Opens</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Conversions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>{campaign.sent}</TableCell>
                      <TableCell>{campaign.opens}</TableCell>
                      <TableCell>{campaign.clicks}</TableCell>
                      <TableCell>{campaign.conversions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/marketing/email">
                <Button className="bg-accent-blue hover:bg-accent-blue/90">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Campaign
                </Button>
              </Link>
            </div>
          </DashboardCard>
          
          <DashboardCard title="Top Keywords">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Difficulty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keywordData.map((keyword, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{keyword.keyword}</TableCell>
                      <TableCell>{keyword.position}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {keyword.change > 0 ? (
                            <ArrowUp className="h-4 w-4 mr-1 text-accent-green" />
                          ) : keyword.change < 0 ? (
                            <ArrowDown className="h-4 w-4 mr-1 text-red-500" />
                          ) : (
                            <span className="h-4 w-4 mr-1">-</span>
                          )}
                          {keyword.change !== 0 && Math.abs(keyword.change)}
                        </div>
                      </TableCell>
                      <TableCell>{keyword.volume.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            keyword.difficulty === 'Low' ? 'border-accent-green text-accent-green' :
                            keyword.difficulty === 'Medium' ? 'border-accent-orange text-accent-orange' :
                            'border-red-500 text-red-500'
                          }
                        >
                          {keyword.difficulty}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/marketing/seo">
                <Button variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  View All Keywords
                </Button>
              </Link>
            </div>
          </DashboardCard>
        </div>
        
        <DashboardCard title="Automated Marketing Campaigns">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {automatedCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          campaign.status === 'active' ? 'border-accent-green text-accent-green' :
                          'border-accent-orange text-accent-orange'
                        }
                      >
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{campaign.triggers}</TableCell>
                    <TableCell>{campaign.messages}</TableCell>
                    <TableCell>{campaign.conversions}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/marketing/automated">
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Manage Automated Campaigns
              </Button>
            </Link>
          </div>
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
}
