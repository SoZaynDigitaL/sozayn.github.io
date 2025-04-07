import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatsCard } from '@/components/ui/stats';
import { 
  Mail,
  Users,
  Calendar,
  BadgePercent,
  MousePointer,
  FileEdit,
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
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const emailCampaignSchema = z.object({
  name: z.string().min(3, {
    message: "Campaign name must be at least 3 characters.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(20, {
    message: "Message must be at least 20 characters.",
  }),
  audience: z.enum(['all', 'active', 'inactive', 'new']),
  scheduledAt: z.string().optional(),
});

type EmailCampaignFormValues = z.infer<typeof emailCampaignSchema>;

export default function EmailCampaignsPage() {
  const { toast } = useToast();
  
  // Email campaign stats
  const emailStats = {
    subscribers: 3240,
    openRate: 23.4,
    clickRate: 4.7,
    campaigns: 18
  };
  
  // Email form
  const emailForm = useForm<EmailCampaignFormValues>({
    resolver: zodResolver(emailCampaignSchema),
    defaultValues: {
      name: '',
      subject: '',
      message: '',
      audience: 'all',
      scheduledAt: '',
    }
  });
  
  // Recent email campaigns
  const emailCampaigns = [
    { id: 1, name: 'Summer Special Offer', sent: '2023-06-12', opens: 345, clicks: 87, status: 'completed' },
    { id: 2, name: 'New Menu Items', sent: '2023-05-28', opens: 412, clicks: 98, status: 'completed' },
    { id: 3, name: 'Customer Appreciation Day', sent: '2023-06-25', opens: 0, clicks: 0, status: 'scheduled' }
  ];
  
  const onEmailSubmit = (data: EmailCampaignFormValues) => {
    console.log('Email campaign scheduled:', data);
    toast({
      title: "Campaign scheduled",
      description: "Your email campaign has been scheduled successfully.",
    });
    emailForm.reset();
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">Email Campaigns</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Total Subscribers"
            value={emailStats.subscribers.toString()}
            icon={<Users className="h-4 w-4 text-accent-blue" />}
            change={5.8}
            progress={78}
            progressColor="bg-accent-blue"
          />
          
          <StatsCard
            title="Open Rate"
            value={`${emailStats.openRate}%`}
            icon={<Mail className="h-4 w-4 text-accent-green" />}
            change={1.2}
            progress={emailStats.openRate}
            progressColor="bg-accent-green"
          />
          
          <StatsCard
            title="Click Rate"
            value={`${emailStats.clickRate}%`}
            icon={<MousePointer className="h-4 w-4 text-accent-orange" />}
            change={0.8}
            progress={emailStats.clickRate * 10}
            progressColor="bg-accent-orange"
          />
          
          <StatsCard
            title="Campaigns"
            value={emailStats.campaigns.toString()}
            icon={<FileEdit className="h-4 w-4 text-accent-purple" />}
            change={3}
            progress={65}
            progressColor="bg-accent-purple"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <DashboardCard title="Recent Campaigns">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Sent Date</TableHead>
                      <TableHead>Opens</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>{campaign.sent}</TableCell>
                        <TableCell>{campaign.opens}</TableCell>
                        <TableCell>{campaign.clicks}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={campaign.status === 'completed' ? 'default' : 'outline'}
                            className={campaign.status === 'completed' ? 'bg-accent-green' : 'border-accent-orange text-accent-orange'}
                          >
                            {campaign.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DashboardCard>
          </div>
          
          <div className="md:col-span-1">
            <DashboardCard title="Audience Stats">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Active Subscribers</p>
                    <p className="text-sm text-text-secondary">Last 30 days</p>
                  </div>
                  <Badge className="bg-accent-blue">2,450</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Subscribers</p>
                    <p className="text-sm text-text-secondary">Last 30 days</p>
                  </div>
                  <Badge className="bg-accent-green">+178</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Inactive Subscribers</p>
                    <p className="text-sm text-text-secondary">90+ days no activity</p>
                  </div>
                  <Badge variant="outline" className="border-accent-orange text-accent-orange">790</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Unsubscribed</p>
                    <p className="text-sm text-text-secondary">Last 30 days</p>
                  </div>
                  <Badge variant="outline" className="border-red-500 text-red-500">-24</Badge>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
        
        <DashboardCard title="Create New Campaign" className="mt-6">
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={emailForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input className="bg-bg-chart border-border-color" placeholder="Summer Special Offer" {...field} />
                      </FormControl>
                      <FormDescription>
                        A name to identify your campaign
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={emailForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Subject</FormLabel>
                      <FormControl>
                        <Input className="bg-bg-chart border-border-color" placeholder="Special Offer Inside!" {...field} />
                      </FormControl>
                      <FormDescription>
                        The subject line of your email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={emailForm.control}
                  name="audience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-bg-chart border-border-color">
                            <SelectValue placeholder="Select audience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Subscribers</SelectItem>
                          <SelectItem value="active">Active Customers</SelectItem>
                          <SelectItem value="inactive">Inactive Customers</SelectItem>
                          <SelectItem value="new">New Subscribers</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select who will receive this email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={emailForm.control}
                  name="scheduledAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" className="bg-bg-chart border-border-color" {...field} />
                      </FormControl>
                      <FormDescription>
                        When to send the campaign (leave empty to send immediately)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-2">
                  <FormField
                    control={emailForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={8} 
                            className="bg-bg-chart border-border-color" 
                            placeholder="Enter your email content here..."
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The main content of your email
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <Button type="submit" className="bg-accent-blue hover:bg-accent-blue/90">
                  <Mail className="mr-2 h-4 w-4" />
                  Schedule Campaign
                </Button>
              </div>
            </form>
          </Form>
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
}