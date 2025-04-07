import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { StatsCard } from '@/components/ui/stats';
import { 
  Megaphone, 
  Zap, 
  Clock, 
  Settings, 
  Tag, 
  CalendarDays, 
  Star, 
  BarChart,
  Play,
  Pause,
  Plus
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
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export default function AutomatedMarketingPage() {
  const { toast } = useToast();
  
  // Automation stats
  const automationStats = {
    activeAutomations: 7,
    completedTasks: 342,
    conversionRate: 15.8,
    averageRevenue: 728
  };
  
  // Active automations
  const activeAutomations = [
    { 
      id: 1, 
      name: 'Welcome Series', 
      status: 'active', 
      type: 'email', 
      triggers: 'New signup', 
      totalSent: 128,
      conversion: 32.5
    },
    { 
      id: 2, 
      name: 'Abandoned Cart', 
      status: 'active', 
      type: 'email,sms', 
      triggers: 'Cart abandonment', 
      totalSent: 87,
      conversion: 21.8
    },
    { 
      id: 3, 
      name: 'Re-engagement', 
      status: 'paused', 
      type: 'email', 
      triggers: '30 days inactive', 
      totalSent: 64,
      conversion: 8.3
    },
    { 
      id: 4, 
      name: 'Birthday Offer', 
      status: 'active', 
      type: 'email,push', 
      triggers: 'Customer birthday', 
      totalSent: 42,
      conversion: 48.2
    },
  ];
  
  // Automation templates
  const automationTemplates = [
    { 
      id: 1, 
      name: 'Welcome Series', 
      description: 'Introduce new customers to your brand and products',
      steps: 3,
      channels: ['Email'],
      icon: Star
    },
    { 
      id: 2, 
      name: 'Abandoned Cart Recovery', 
      description: 'Remind customers about items left in their cart',
      steps: 2,
      channels: ['Email', 'SMS'],
      icon: Tag
    },
    { 
      id: 3, 
      name: 'Re-engagement Campaign', 
      description: 'Win back customers who haven\'t engaged recently',
      steps: 4,
      channels: ['Email', 'Push'],
      icon: Zap
    },
    { 
      id: 4, 
      name: 'Review Request', 
      description: 'Ask customers for reviews after purchase',
      steps: 1,
      channels: ['Email'],
      icon: Star
    }
  ];
  
  const toggleAutomation = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    toast({
      title: `Automation ${newStatus}`,
      description: `The automation has been ${newStatus}.`,
      variant: newStatus === 'active' ? 'default' : 'destructive',
    });
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">Automated Marketing</h1>
          <Button className="bg-accent-blue hover:bg-accent-blue/90">
            <Plus className="mr-2 h-4 w-4" />
            Create New Automation
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Active Automations"
            value={automationStats.activeAutomations.toString()}
            icon={<Zap className="h-4 w-4 text-accent-blue" />}
            change={2}
            progress={70}
            progressColor="bg-accent-blue"
          />
          
          <StatsCard
            title="Completed Tasks"
            value={automationStats.completedTasks.toString()}
            icon={<Clock className="h-4 w-4 text-accent-green" />}
            change={58}
            progress={85}
            progressColor="bg-accent-green"
          />
          
          <StatsCard
            title="Conversion Rate"
            value={`${automationStats.conversionRate}%`}
            icon={<BarChart className="h-4 w-4 text-accent-orange" />}
            change={3.2}
            progress={automationStats.conversionRate * 5}
            progressColor="bg-accent-orange"
          />
          
          <StatsCard
            title="Avg. Revenue"
            value={`$${automationStats.averageRevenue}`}
            icon={<Tag className="h-4 w-4 text-accent-purple" />}
            change={12.5}
            progress={65}
            progressColor="bg-accent-purple"
          />
        </div>
        
        <DashboardCard title="Active Automations">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Channels</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Conversion</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeAutomations.map((automation) => (
                  <TableRow key={automation.id}>
                    <TableCell className="font-medium">{automation.name}</TableCell>
                    <TableCell>{automation.triggers}</TableCell>
                    <TableCell>
                      {automation.type.split(',').map((type) => (
                        <Badge key={type} variant="outline" className="mr-1 capitalize">
                          {type}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>{automation.totalSent}</TableCell>
                    <TableCell>{automation.conversion}%</TableCell>
                    <TableCell>
                      <Badge 
                        variant={automation.status === 'active' ? 'default' : 'outline'}
                        className={automation.status === 'active' ? 'bg-accent-green' : 'border-accent-orange text-accent-orange'}
                      >
                        {automation.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toggleAutomation(automation.id, automation.status)}
                        >
                          {automation.status === 'active' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DashboardCard>
        
        <h2 className="text-xl font-bold mt-8">Automation Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {automationTemplates.map((template) => (
            <Card key={template.id} className="bg-bg-card border-border-color hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">{template.description}</CardDescription>
                  </div>
                  <template.icon className="h-6 w-6 text-accent-blue" />
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-1.5 text-text-secondary" />
                    <span>{template.steps} steps</span>
                  </div>
                  <div className="flex">
                    {template.channels.map(channel => (
                      <Badge key={channel} variant="outline" className="mr-1 text-[10px]">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-1">
                <Button size="sm" variant="outline" className="w-full">
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <DashboardCard title="Settings" className="mt-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">General Settings</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Maximum email frequency</p>
                  <p className="text-sm text-text-secondary">Limit how often customers receive emails</p>
                </div>
                <Select defaultValue="3">
                  <SelectTrigger className="w-40 bg-bg-chart border-border-color">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 per day</SelectItem>
                    <SelectItem value="3">3 per week</SelectItem>
                    <SelectItem value="5">5 per week</SelectItem>
                    <SelectItem value="7">7 per week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily sending window</p>
                  <p className="text-sm text-text-secondary">Time range when emails can be sent</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="time"
                    defaultValue="09:00"
                    className="w-24 bg-bg-chart border-border-color"
                  />
                  <span>to</span>
                  <Input 
                    type="time"
                    defaultValue="20:00"
                    className="w-24 bg-bg-chart border-border-color"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Smart sending</p>
                  <p className="text-sm text-text-secondary">Optimize send time based on open history</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-pause on low engagement</p>
                  <p className="text-sm text-text-secondary">Pause automations if engagement falls below threshold</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="button" className="bg-accent-blue hover:bg-accent-blue/90">
                Save Settings
              </Button>
            </div>
          </div>
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
}