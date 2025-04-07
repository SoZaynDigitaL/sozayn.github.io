import DashboardLayout from '@/components/layout/DashboardLayout';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatsCard } from '@/components/ui/stats';
import { 
  Search,
  ChevronRight,
  PlusCircle,
  Award,
  Users,
  Gem,
  Gift,
  ShoppingBag,
  Calendar,
  CircleCheck
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function LoyaltyPage() {
  // This component now includes all the loyalty program functionality directly
  
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  
  // Loyalty program metrics
  const loyaltyMetrics = {
    activeMembers: 1245,
    totalRewards: 458,
    redemptionRate: 68,
    pointsIssued: 187650
  };
  
  // Mock customer data (this would come from an API in production)
  const customers = [
    { 
      id: 1, 
      name: 'John Smith', 
      email: 'john.smith@example.com', 
      points: 750, 
      tier: 'gold', 
      joinDate: '2023-01-15', 
      lastVisit: '2023-06-20'
    },
    { 
      id: 2, 
      name: 'Maria Garcia', 
      email: 'maria.g@example.com', 
      points: 320, 
      tier: 'silver', 
      joinDate: '2023-02-28', 
      lastVisit: '2023-06-18'
    },
    { 
      id: 3, 
      name: 'David Kim', 
      email: 'david.k@example.com', 
      points: 1250, 
      tier: 'platinum', 
      joinDate: '2022-11-05', 
      lastVisit: '2023-06-21'
    },
    { 
      id: 4, 
      name: 'Sarah Johnson', 
      email: 'sarah.j@example.com', 
      points: 180, 
      tier: 'bronze', 
      joinDate: '2023-04-10', 
      lastVisit: '2023-06-15'
    },
    { 
      id: 5, 
      name: 'Alex Patel', 
      email: 'alex.p@example.com', 
      points: 890, 
      tier: 'gold', 
      joinDate: '2023-01-20', 
      lastVisit: '2023-06-19'
    }
  ];
  
  // Tier distribution data
  const tierData = [
    { name: 'Bronze', value: 35 },
    { name: 'Silver', value: 40 },
    { name: 'Gold', value: 20 },
    { name: 'Platinum', value: 5 }
  ];
  
  const rewardCategories = [
    { name: 'Free Items', value: 45 },
    { name: 'Discounts', value: 30 },
    { name: 'Exclusive Offers', value: 15 },
    { name: 'Gift Cards', value: 10 }
  ];
  
  const pointsHistory = [
    { month: 'Jan', earned: 15200, redeemed: 8500 },
    { month: 'Feb', earned: 16800, redeemed: 7200 },
    { month: 'Mar', earned: 18500, redeemed: 9700 },
    { month: 'Apr', earned: 17900, redeemed: 11200 },
    { month: 'May', earned: 20300, redeemed: 13500 },
    { month: 'Jun', earned: 21500, redeemed: 12800 }
  ];
  
  const COLORS = ['#4361ee', '#8957e5', '#2ea043', '#ff9f1c'];
  
  // Available rewards
  const availableRewards = [
    { id: 1, name: 'Free Appetizer', points: 250, description: 'Enjoy a complimentary appetizer with your next meal', expires: '2023-09-30', type: 'Free Item' },
    { id: 2, name: '$10 Off Your Order', points: 500, description: '$10 discount on any order over $30', expires: '2023-08-15', type: 'Discount' },
    { id: 3, name: 'Free Delivery', points: 150, description: 'Free delivery on your next order', expires: '2023-07-31', type: 'Free Service' },
    { id: 4, name: 'Special Menu Access', points: 800, description: 'Exclusive access to our special seasonal menu', expires: '2023-10-15', type: 'Exclusive Offer' },
    { id: 5, name: 'Buy One Get One Free', points: 650, description: 'Buy any entree and get one of equal or lesser value free', expires: '2023-08-31', type: 'Free Item' }
  ];
  
  // Recent redemptions
  const recentRedemptions = [
    { id: 1, customer: 'David Kim', reward: 'Free Appetizer', date: '2023-06-21', points: 250 },
    { id: 2, customer: 'Maria Garcia', reward: '$10 Off Your Order', date: '2023-06-18', points: 500 },
    { id: 3, customer: 'John Smith', reward: 'Free Delivery', date: '2023-06-15', points: 150 },
    { id: 4, customer: 'Alex Patel', reward: 'Buy One Get One Free', date: '2023-06-12', points: 650 }
  ];
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">Loyalty & Rewards</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Active Members"
            value={loyaltyMetrics.activeMembers.toString()}
            icon={<Users className="h-4 w-4 text-accent-blue" />}
            change={12.5}
            progress={70}
            progressColor="bg-accent-blue"
          />
          
          <StatsCard
            title="Rewards Redeemed"
            value={loyaltyMetrics.totalRewards.toString()}
            icon={<Gift className="h-4 w-4 text-accent-purple" />}
            change={8.3}
            progress={65}
            progressColor="bg-accent-purple"
          />
          
          <StatsCard
            title="Redemption Rate"
            value={`${loyaltyMetrics.redemptionRate}%`}
            icon={<Award className="h-4 w-4 text-accent-green" />}
            change={5.2}
            progress={68}
            progressColor="bg-accent-green"
          />
          
          <StatsCard
            title="Points Issued"
            value={loyaltyMetrics.pointsIssued.toString()}
            icon={<Gem className="h-4 w-4 text-accent-orange" />}
            change={15.8}
            progress={75}
            progressColor="bg-accent-orange"
          />
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              <span>Rewards</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Program Settings</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Overview tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <DashboardCard title="Points Activity" className="h-full">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pointsHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                        <XAxis 
                          dataKey="month" 
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
                        <Bar dataKey="earned" fill="var(--accent-blue)" name="Points Earned" />
                        <Bar dataKey="redeemed" fill="var(--accent-purple)" name="Points Redeemed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </DashboardCard>
              </div>
              
              <DashboardCard title="Member Tiers" className="h-full">
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tierData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {tierData.map((entry, index) => (
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
              <DashboardCard title="Recent Redemptions">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Reward</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentRedemptions.map((redemption) => (
                        <TableRow key={redemption.id}>
                          <TableCell>{redemption.customer}</TableCell>
                          <TableCell>{redemption.reward}</TableCell>
                          <TableCell>{redemption.date}</TableCell>
                          <TableCell>{redemption.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DashboardCard>
              
              <DashboardCard title="Reward Usage">
                <div className="h-[250px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rewardCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {rewardCategories.map((entry, index) => (
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
          </TabsContent>
          
          {/* Members tab */}
          <TabsContent value="members">
            <DashboardCard title="Loyalty Program Members">
              <div className="flex items-center mb-6 gap-2">
                <Input placeholder="Search members..." className="max-w-sm bg-bg-chart border-border-color" />
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.points}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              customer.tier === 'bronze' ? 'border-orange-500 text-orange-500' :
                              customer.tier === 'silver' ? 'border-slate-400 text-slate-400' :
                              customer.tier === 'gold' ? 'border-yellow-500 text-yellow-500' :
                              'border-accent-purple text-accent-purple'
                            }
                          >
                            {customer.tier.charAt(0).toUpperCase() + customer.tier.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{customer.joinDate}</TableCell>
                        <TableCell>{customer.lastVisit}</TableCell>
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
              
              <div className="flex justify-between items-center mt-6">
                <div>
                  <Button variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </DashboardCard>
          </TabsContent>
          
          {/* Rewards tab */}
          <TabsContent value="rewards">
            <DashboardCard title="Available Rewards">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reward</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Points Required</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableRewards.map((reward) => (
                      <TableRow key={reward.id}>
                        <TableCell className="font-medium">{reward.name}</TableCell>
                        <TableCell>{reward.description}</TableCell>
                        <TableCell>{reward.points}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-accent-blue text-accent-blue">
                            {reward.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{reward.expires}</TableCell>
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
              
              <div className="mt-6">
                <Button className="bg-accent-blue hover:bg-accent-blue/90">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Reward
                </Button>
              </div>
            </DashboardCard>
          </TabsContent>
          
          {/* Settings tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DashboardCard title="Program Tiers">
                <div className="space-y-6">
                  <div className="p-4 border border-border-color rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center mr-2">
                          <Award className="h-4 w-4 text-orange-500" />
                        </div>
                        <h3 className="font-medium">Bronze Tier</h3>
                      </div>
                      <Badge variant="outline" className="border-orange-500 text-orange-500">
                        0 - 499 points
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">Basic rewards and special offers for new members</p>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center"><CircleCheck className="h-3 w-3 mr-2 text-accent-green" /> Birthday offer</li>
                      <li className="flex items-center"><CircleCheck className="h-3 w-3 mr-2 text-accent-green" /> 5% off selected items</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border border-border-color rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-slate-400/20 rounded-full flex items-center justify-center mr-2">
                          <Award className="h-4 w-4 text-slate-400" />
                        </div>
                        <h3 className="font-medium">Silver Tier</h3>
                      </div>
                      <Badge variant="outline" className="border-slate-400 text-slate-400">
                        500 - 999 points
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">More rewards and perks for regular customers</p>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center"><CircleCheck className="h-3 w-3 mr-2 text-accent-green" /> All Bronze benefits</li>
                      <li className="flex items-center"><CircleCheck className="h-3 w-3 mr-2 text-accent-green" /> Free delivery</li>
                      <li className="flex items-center"><CircleCheck className="h-3 w-3 mr-2 text-accent-green" /> 10% off selected items</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border border-border-color rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center mr-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                        </div>
                        <h3 className="font-medium">Gold Tier</h3>
                      </div>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                        1000 - 1999 points
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">Premium perks for our loyal customers</p>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center"><CircleCheck className="h-3 w-3 mr-2 text-accent-green" /> All Silver benefits</li>
                      <li className="flex items-center"><CircleCheck className="h-3 w-3 mr-2 text-accent-green" /> Priority service</li>
                      <li className="flex items-center"><CircleCheck className="h-3 w-3 mr-2 text-accent-green" /> 15% off selected items</li>
                      <li className="flex items-center"><CircleCheck className="h-3 w-3 mr-2 text-accent-green" /> Exclusive offers</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border border-border-color rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-accent-purple/20 rounded-full flex items-center justify-center mr-2">
                          <Award className="h-4 w-4 text-accent-purple" />
                        </div>
                        <h3 className="font-medium">Platinum Tier</h3>
                      </div>
                      <Badge variant="outline" className="border-accent-purple text-accent-purple">
                        2000+ points
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">VIP experience for our most loyal customers</p>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center"><CircleCheck className="h-3 w-3 mr-2 text-accent-green" /> All Gold benefits</li>
                      <li className="flex items-center"><CircleCheck className="h-3 w-3 mr-2 text-accent-green" /> Personal concierge</li>
                      <li className="flex items-center"><CircleCheck className="h-3 w-3 mr-2 text-accent-green" /> 20% off all menu items</li>
                      <li className="flex items-center"><CircleCheck className="h-3 w-3 mr-2 text-accent-green" /> Special events access</li>
                      <li className="flex items-center"><CircleCheck className="h-3 w-3 mr-2 text-accent-green" /> Chef's table reservation priority</li>
                    </ul>
                  </div>
                </div>
              </DashboardCard>
              
              <DashboardCard title="Points Settings">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Points Earning</label>
                    <div className="p-4 border border-border-color rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Purchases</p>
                          <p className="text-sm text-text-secondary">Points earned per $1 spent</p>
                        </div>
                        <div className="flex items-center">
                          <Input 
                            className="w-16 h-8 bg-bg-chart border-border-color" 
                            value="10" 
                          />
                          <span className="ml-2">points</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Online Orders</p>
                          <p className="text-sm text-text-secondary">Bonus points for online orders</p>
                        </div>
                        <div className="flex items-center">
                          <Input 
                            className="w-16 h-8 bg-bg-chart border-border-color" 
                            value="50" 
                          />
                          <span className="ml-2">points</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Referral Bonus</p>
                          <p className="text-sm text-text-secondary">Points for referring a new customer</p>
                        </div>
                        <div className="flex items-center">
                          <Input 
                            className="w-16 h-8 bg-bg-chart border-border-color" 
                            value="200" 
                          />
                          <span className="ml-2">points</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Program Settings</label>
                    <div className="p-4 border border-border-color rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Points Expiration</p>
                          <p className="text-sm text-text-secondary">How long points remain valid</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input 
                            className="w-16 h-8 bg-bg-chart border-border-color" 
                            value="12" 
                          />
                          <span>months</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Birthday Bonus</p>
                          <p className="text-sm text-text-secondary">Points awarded on member's birthday</p>
                        </div>
                        <div className="flex items-center">
                          <Input 
                            className="w-16 h-8 bg-bg-chart border-border-color" 
                            value="500" 
                          />
                          <span className="ml-2">points</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Minimum Redemption</p>
                          <p className="text-sm text-text-secondary">Minimum points needed for redemption</p>
                        </div>
                        <div className="flex items-center">
                          <Input 
                            className="w-16 h-8 bg-bg-chart border-border-color" 
                            value="100" 
                          />
                          <span className="ml-2">points</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button className="bg-accent-blue hover:bg-accent-blue/90">
                      Save Settings
                    </Button>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
