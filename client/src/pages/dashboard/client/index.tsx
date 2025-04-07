import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import ClientDashboardLayout from '@/components/layout/ClientDashboardLayout';
import { Button } from '@/components/ui/button';
import {
  ArrowUp,
  Clock,
  DollarSign,
  Users,
  ChevronDown,
  Crown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

// Match exactly the layout shown in the screenshot
export default function ClientDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chartData, setChartData] = useState([
    { name: 'Week 1', value: 300 },
    { name: 'Week 2', value: 450 },
    { name: 'Week 3', value: 400 },
    { name: 'Week 4', value: 470 }
  ]);

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
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
    }
  });

  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome, SoZayn Admin</h1>
            <p className="text-gray-400 text-sm">
              Here's what's happening with your restaurant today
            </p>
          </div>
          
          <Button 
            onClick={() => generateDemoData.mutate()}
            disabled={generateDemoData.isPending}
            className="bg-[#4361ee] hover:bg-[#3a56dd] text-white"
          >
            Generate Demo Data
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Orders */}
          <Card className="bg-[#1f2940] border-0 p-4 rounded-md shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-400 text-xs">Total Orders</p>
                <p className="text-2xl font-semibold mt-1">0</p>
                <div className="flex items-center mt-1">
                  <Badge className="bg-green-500/20 text-green-500 text-xs px-1.5 rounded">
                    <ArrowUp className="h-3 w-3 mr-1" />+15.8%
                  </Badge>
                </div>
              </div>
              <div className="h-8 w-8 bg-[#4361ee]/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4361ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <line x1="3" x2="21" y1="9" y2="9" />
                  <line x1="9" x2="9" y1="21" y2="9" />
                </svg>
              </div>
            </div>
          </Card>

          {/* Revenue */}
          <Card className="bg-[#1f2940] border-0 p-4 rounded-md shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-400 text-xs">Revenue</p>
                <p className="text-2xl font-semibold mt-1">$0.00</p>
                <div className="flex items-center mt-1">
                  <Badge className="bg-green-500/20 text-green-500 text-xs px-1.5 rounded">
                    <ArrowUp className="h-3 w-3 mr-1" />+24.3%
                  </Badge>
                </div>
              </div>
              <div className="h-8 w-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </Card>

          {/* Avg. Delivery Time */}
          <Card className="bg-[#1f2940] border-0 p-4 rounded-md shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-400 text-xs">Avg. Delivery Time</p>
                <p className="text-2xl font-semibold mt-1">24 min</p>
                <div className="flex items-center mt-1">
                  <Badge className="bg-amber-500/20 text-amber-500 text-xs px-1.5 rounded">
                    <ArrowUp className="h-3 w-3 mr-1" />+1.2%
                  </Badge>
                </div>
              </div>
              <div className="h-8 w-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
            </div>
          </Card>

          {/* Active Customers */}
          <Card className="bg-[#1f2940] border-0 p-4 rounded-md shadow-sm">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-400 text-xs">Active Customers</p>
                <p className="text-2xl font-semibold mt-1">423</p>
                <div className="flex items-center mt-1">
                  <Badge className="bg-purple-500/20 text-purple-500 text-xs px-1.5 rounded">
                    <ArrowUp className="h-3 w-3 mr-1" />+11.7%
                  </Badge>
                </div>
              </div>
              <div className="h-8 w-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Sales Overview Chart */}
        <Card className="bg-[#1f2940] border-0 p-6 rounded-md shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold">Sales Overview</h2>
            </div>
            <div className="flex space-x-4">
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  className="text-sm font-medium text-gray-300 hover:text-white px-2 py-1 h-auto"
                >
                  Orders
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-sm text-gray-400 hover:text-white px-2 py-1 h-auto"
                >
                  Revenue
                </Button>
              </div>
              <Button 
                variant="outline" 
                className="flex items-center gap-1 h-8 text-sm bg-[#141b2d] border-[#2d3748] text-gray-300"
              >
                Weekly
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis 
                  hide={true}
                />
                <Bar 
                  dataKey="value" 
                  fill="#4361ee" 
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bottom row - Two cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top-Selling Items */}
          <Card className="bg-[#1f2940] border-0 p-6 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Top-Selling Items</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-md flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-500">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Cheeseburger Deluxe</p>
                    <p className="text-xs text-gray-400">$12.00</p>
                  </div>
                </div>
                <div className="w-24 h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-md flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-500">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Chicken Wings</p>
                    <p className="text-xs text-gray-400">$10.99</p>
                  </div>
                </div>
                <div className="w-24 h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Order Sources */}
          <Card className="bg-[#1f2940] border-0 p-6 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Order Sources</h2>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Website</span>
                  <span className="text-sm font-medium"></span>
                </div>
                <div className="h-2 bg-[#141b2d] rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">DoorDash</span>
                </div>
                <div className="h-2 bg-[#141b2d] rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ClientDashboardLayout>
  );
}