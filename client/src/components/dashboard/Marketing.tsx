import { useState, useEffect } from 'react';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/ui/stats';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Search,
  Globe,
  Mail,
  Share2,
  Instagram,
  Facebook,
  Twitter,
  AlertCircle,
  ArrowRight,
  Calendar,
  PlusCircle,
  Users,
  Megaphone,
  BarChart,
  Link as LinkIcon,
  Settings,
  Check,
  X
} from 'lucide-react';
import { FaYoutube, FaLinkedin, FaTiktok } from 'react-icons/fa';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const socialPostSchema = z.object({
  platform: z.enum(['instagram', 'facebook', 'twitter', 'youtube', 'linkedin', 'tiktok']),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
  imageUrl: z.string().optional(),
  scheduledAt: z.string().optional(),
});

const socialAccountSchema = z.object({
  platform: z.enum(['instagram', 'facebook', 'twitter', 'youtube', 'linkedin', 'tiktok']),
  accountName: z.string().min(3, {
    message: "Account name must be at least 3 characters.",
  }),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  profileUrl: z.string().url({
    message: "Profile URL must be a valid URL.",
  }).optional(),
});

type SocialPostFormValues = z.infer<typeof socialPostSchema>;
type SocialAccountFormValues = z.infer<typeof socialAccountSchema>;

export default function Marketing() {
  const [activeTab, setActiveTab] = useState('seo');
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Social media account form
  const socialAccountForm = useForm<SocialAccountFormValues>({
    resolver: zodResolver(socialAccountSchema),
    defaultValues: {
      platform: 'instagram',
      accountName: '',
      profileUrl: '',
    }
  });
  
  // Fetch social media accounts
  const { data: socialAccounts = [], isLoading: isLoadingSocialAccounts } = useQuery({
    queryKey: ['/api/social-media-accounts'],
    queryFn: () => 
      apiRequest('GET', '/api/social-media-accounts').then((res) => res.json()),
  });
  
  // Add social media account mutation
  const addSocialAccountMutation = useMutation({
    mutationFn: (data: SocialAccountFormValues) => 
      apiRequest('POST', '/api/social-media-accounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-media-accounts'] });
      setIsAddingAccount(false);
      socialAccountForm.reset();
      toast({
        title: "Account Connected",
        description: `Your social media account has been connected successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to connect account: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete social media account mutation
  const deleteSocialAccountMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/social-media-accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-media-accounts'] });
      toast({
        title: "Account Removed",
        description: "The social media account has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to remove account: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSocialAccountSubmit = (data: SocialAccountFormValues) => {
    addSocialAccountMutation.mutate(data);
  };
  
  // SEO stats
  const seoStats = {
    searchRank: 24,
    monthlyVisitors: 1250,
    keywordRank: 85,
    pageSpeed: 92
  };
  
  // Social media stats
  const socialStats = {
    followers: 4580,
    engagement: 6.2,
    posts: 124,
    clicks: 840
  };
  
  // Email campaign stats
  const emailStats = {
    subscribers: 3240,
    openRate: 23.4,
    clickRate: 4.7,
    campaigns: 18
  };
  
  // Email form schema
  const emailSubscriberSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    name: z.string().min(2, { message: "Name must be at least 2 characters" }).optional(),
    additionalFields: z.record(z.string()).optional()
  });

  type EmailSubscriberFormValues = z.infer<typeof emailSubscriberSchema>;

  const emailCampaignSchema = z.object({
    name: z.string().min(3, { message: "Campaign name must be at least 3 characters" }),
    subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
    content: z.string().min(10, { message: "Content must be at least 10 characters" }),
    scheduledFor: z.string().optional(),
  });

  type EmailCampaignFormValues = z.infer<typeof emailCampaignSchema>;

  // Fetch email subscribers
  const { data: emailSubscribers = [], isLoading: isLoadingSubscribers } = useQuery({
    queryKey: ['/api/email-marketing/subscribers'],
    queryFn: () => 
      apiRequest('GET', '/api/email-marketing/subscribers')
        .then((res) => res.json())
        .catch(() => []), // Fallback to empty array if API fails
  });

  // Fetch email campaigns
  const { data: emailCampaignsList = [], isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['/api/email-marketing/campaigns'],
    queryFn: () => 
      apiRequest('GET', '/api/email-marketing/campaigns')
        .then((res) => res.json())
        .catch(() => []), // Fallback to empty array if API fails
  });

  // Add email subscriber mutation
  const addSubscriberMutation = useMutation({
    mutationFn: (data: EmailSubscriberFormValues) => 
      apiRequest('POST', '/api/email-marketing/subscribers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-marketing/subscribers'] });
      emailSubscriberForm.reset();
      toast({
        title: "Subscriber Added",
        description: "The email subscriber has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to add subscriber: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Email subscriber form
  const emailSubscriberForm = useForm<EmailSubscriberFormValues>({
    resolver: zodResolver(emailSubscriberSchema),
    defaultValues: {
      email: '',
      name: '',
    }
  });

  // Email campaign form
  const emailCampaignForm = useForm<EmailCampaignFormValues>({
    resolver: zodResolver(emailCampaignSchema),
    defaultValues: {
      name: '',
      subject: '',
      content: '',
      scheduledFor: '',
    }
  });

  const onEmailSubscriberSubmit = (data: EmailSubscriberFormValues) => {
    addSubscriberMutation.mutate(data);
  };

  const onEmailCampaignSubmit = (data: EmailCampaignFormValues) => {
    console.log('Email campaign created:', data);
    toast({
      title: "Campaign Created",
      description: "Your email campaign has been created successfully.",
    });
    emailCampaignForm.reset();
  };

  // SEO form
  const seoForm = useForm({
    defaultValues: {
      title: 'Delicious Restaurant | Best Burgers and Pizza in Town',
      description: 'Order delicious food from our menu and get it delivered to your doorstep. We offer the best burgers, pizza, and more in town.',
      keywords: 'restaurant, food delivery, burgers, pizza, online ordering',
      trackingEnabled: true,
      sitemapEnabled: true,
      metaTagsEnabled: true,
    }
  });
  
  // Social media form
  const socialForm = useForm<SocialPostFormValues>({
    resolver: zodResolver(socialPostSchema),
    defaultValues: {
      platform: 'instagram',
      message: '',
      imageUrl: '',
      scheduledAt: '',
    }
  });
  
  const onSEOSubmit = (data: any) => {
    console.log('SEO settings updated:', data);
    toast({
      title: "SEO settings updated",
      description: "Your SEO settings have been saved successfully.",
    });
  };
  
  const onSocialSubmit = (data: SocialPostFormValues) => {
    console.log('Social post scheduled:', data);
    toast({
      title: "Post scheduled",
      description: `Your ${data.platform} post has been scheduled successfully.`,
    });
    socialForm.reset();
  };
  
  // Social media performance data
  const socialPerformanceData = [
    { name: 'Instagram', value: 45 },
    { name: 'Facebook', value: 30 },
    { name: 'Twitter', value: 25 },
  ];
  
  const COLORS = ['#4361ee', '#8957e5', '#2ea043'];
  
  // Traffic source data
  const trafficSourceData = [
    { name: 'Google', value: 68 },
    { name: 'Direct', value: 12 },
    { name: 'Social', value: 15 },
    { name: 'Referral', value: 5 }
  ];
  
  // Website visitors data
  const visitorsData = [
    { name: 'Jan', visitors: 420 },
    { name: 'Feb', visitors: 480 },
    { name: 'Mar', visitors: 550 },
    { name: 'Apr', visitors: 620 },
    { name: 'May', visitors: 700 },
    { name: 'Jun', visitors: 820 }
  ];
  
  // Recent email campaigns
  const emailCampaigns = [
    { id: 1, name: 'Summer Special Offer', sent: '2023-06-12', opens: 345, clicks: 87, status: 'completed' },
    { id: 2, name: 'New Menu Items', sent: '2023-05-28', opens: 412, clicks: 98, status: 'completed' },
    { id: 3, name: 'Customer Appreciation Day', sent: '2023-06-25', opens: 0, clicks: 0, status: 'scheduled' }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Marketing & SEO</h1>
      </div>
      
      <Tabs defaultValue="seo" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>SEO</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            <span>Social Media</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Email Marketing</span>
          </TabsTrigger>
        </TabsList>
        
        {/* SEO Tab */}
        <TabsContent value="seo">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Search Rank"
              value={`#${seoStats.searchRank}`}
              icon={<Search className="h-4 w-4 text-accent-blue" />}
              change={-5.2}
              progress={80}
              progressColor="bg-accent-blue"
            />
            
            <StatsCard
              title="Monthly Visitors"
              value={seoStats.monthlyVisitors.toString()}
              icon={<BarChart className="h-4 w-4 text-accent-green" />}
              change={12.7}
              progress={65}
              progressColor="bg-accent-green"
            />
            
            <StatsCard
              title="Keyword Ranking"
              value={`${seoStats.keywordRank}%`}
              icon={<AlertCircle className="h-4 w-4 text-accent-orange" />}
              change={8.4}
              progress={85}
              progressColor="bg-accent-orange"
            />
            
            <StatsCard
              title="Page Speed"
              value={`${seoStats.pageSpeed}/100`}
              icon={<ArrowRight className="h-4 w-4 text-accent-purple" />}
              change={2.1}
              progress={92}
              progressColor="bg-accent-purple"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <DashboardCard title="Website Traffic" className="h-full">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={visitorsData}>
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
                      <Line 
                        type="monotone" 
                        dataKey="visitors" 
                        stroke="var(--accent-blue)" 
                        strokeWidth={2}
                        dot={{ fill: 'var(--accent-blue)', r: 4 }}
                        activeDot={{ r: 6, fill: 'var(--accent-blue)' }}
                      />
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
                      data={trafficSourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {trafficSourceData.map((entry, index) => (
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
          
          <DashboardCard title="SEO Settings" className="mt-6">
            <form onSubmit={seoForm.handleSubmit(onSEOSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="title">Page Title</label>
                    <Input 
                      id="title" 
                      className="bg-bg-chart border-border-color"
                      {...seoForm.register('title')} 
                    />
                    <p className="text-xs text-text-secondary">
                      This will appear in search engine results and browser tabs.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="description">Meta Description</label>
                    <Textarea 
                      id="description" 
                      rows={3}
                      className="bg-bg-chart border-border-color"
                      {...seoForm.register('description')} 
                    />
                    <p className="text-xs text-text-secondary">
                      A short description of your page that appears in search results.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="keywords">Keywords</label>
                    <Input 
                      id="keywords" 
                      className="bg-bg-chart border-border-color"
                      {...seoForm.register('keywords')} 
                    />
                    <p className="text-xs text-text-secondary">
                      Comma-separated keywords related to your business.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">SEO Tools</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Google Analytics Tracking</p>
                        <p className="text-sm text-text-secondary">Enable visitor tracking</p>
                      </div>
                      <Switch 
                        {...seoForm.register('trackingEnabled')}
                        checked={seoForm.watch('trackingEnabled')}
                        onCheckedChange={(value) => seoForm.setValue('trackingEnabled', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">XML Sitemap</p>
                        <p className="text-sm text-text-secondary">Help search engines crawl your site</p>
                      </div>
                      <Switch 
                        {...seoForm.register('sitemapEnabled')}
                        checked={seoForm.watch('sitemapEnabled')}
                        onCheckedChange={(value) => seoForm.setValue('sitemapEnabled', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Social Meta Tags</p>
                        <p className="text-sm text-text-secondary">Enable rich social media sharing</p>
                      </div>
                      <Switch 
                        {...seoForm.register('metaTagsEnabled')}
                        checked={seoForm.watch('metaTagsEnabled')}
                        onCheckedChange={(value) => seoForm.setValue('metaTagsEnabled', value)}
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
                    <h3 className="font-medium flex items-center text-accent-blue mb-2">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      SEO Tips
                    </h3>
                    <ul className="text-sm space-y-1 text-text-secondary">
                      <li>• Use your main keywords in your page title</li>
                      <li>• Create unique descriptions for each page</li>
                      <li>• Include local keywords if you serve a specific area</li>
                      <li>• Update your content regularly to stay relevant</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" className="bg-accent-blue hover:bg-accent-blue/90">
                  Save SEO Settings
                </Button>
              </div>
            </form>
          </DashboardCard>
        </TabsContent>
        
        {/* Social Media Tab */}
        <TabsContent value="social">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Followers"
              value={socialStats.followers.toString()}
              icon={<Users className="h-4 w-4 text-accent-blue" />}
              change={23.5}
              progress={70}
              progressColor="bg-accent-blue"
            />
            
            <StatsCard
              title="Engagement Rate"
              value={`${socialStats.engagement}%`}
              icon={<Share2 className="h-4 w-4 text-accent-purple" />}
              change={1.8}
              progress={62}
              progressColor="bg-accent-purple"
            />
            
            <StatsCard
              title="Total Posts"
              value={socialStats.posts.toString()}
              icon={<Instagram className="h-4 w-4 text-accent-orange" />}
              change={8.4}
              progress={55}
              progressColor="bg-accent-orange"
            />
            
            <StatsCard
              title="Link Clicks"
              value={socialStats.clicks.toString()}
              icon={<ArrowRight className="h-4 w-4 text-accent-green" />}
              change={15.7}
              progress={78}
              progressColor="bg-accent-green"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <DashboardCard title="Schedule a Social Post">
                <Form {...socialForm}>
                  <form onSubmit={socialForm.handleSubmit(onSocialSubmit)} className="space-y-6">
                    <FormField
                      control={socialForm.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform</FormLabel>
                          <div className="flex flex-wrap gap-4">
                            <div 
                              className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border ${field.value === 'instagram' ? 'border-accent-purple bg-accent-purple/10' : 'border-border-color'}`}
                              onClick={() => field.onChange('instagram')}
                            >
                              <Instagram className={`h-5 w-5 ${field.value === 'instagram' ? 'text-accent-purple' : 'text-text-secondary'}`} />
                            </div>
                            <div 
                              className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border ${field.value === 'facebook' ? 'border-accent-blue bg-accent-blue/10' : 'border-border-color'}`}
                              onClick={() => field.onChange('facebook')}
                            >
                              <Facebook className={`h-5 w-5 ${field.value === 'facebook' ? 'text-accent-blue' : 'text-text-secondary'}`} />
                            </div>
                            <div 
                              className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border ${field.value === 'twitter' ? 'border-accent-blue bg-accent-blue/10' : 'border-border-color'}`}
                              onClick={() => field.onChange('twitter')}
                            >
                              <Twitter className={`h-5 w-5 ${field.value === 'twitter' ? 'text-accent-blue' : 'text-text-secondary'}`} />
                            </div>
                            <div 
                              className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border ${field.value === 'youtube' ? 'border-red-500 bg-red-500/10' : 'border-border-color'}`}
                              onClick={() => field.onChange('youtube')}
                            >
                              <FaYoutube className={`h-5 w-5 ${field.value === 'youtube' ? 'text-red-500' : 'text-text-secondary'}`} />
                            </div>
                            <div 
                              className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border ${field.value === 'linkedin' ? 'border-blue-600 bg-blue-600/10' : 'border-border-color'}`}
                              onClick={() => field.onChange('linkedin')}
                            >
                              <FaLinkedin className={`h-5 w-5 ${field.value === 'linkedin' ? 'text-blue-600' : 'text-text-secondary'}`} />
                            </div>
                            <div 
                              className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border ${field.value === 'tiktok' ? 'border-black bg-black/10' : 'border-border-color'}`}
                              onClick={() => field.onChange('tiktok')}
                            >
                              <FaTiktok className={`h-5 w-5 ${field.value === 'tiktok' ? 'text-black' : 'text-text-secondary'}`} />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={socialForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter your post message" 
                              className="bg-bg-chart border-border-color" 
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            {field.value.length}/280 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={socialForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter image URL" 
                              className="bg-bg-chart border-border-color" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={socialForm.control}
                      name="scheduledAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schedule For (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-text-secondary" />
                              <Input 
                                type="datetime-local" 
                                className="bg-bg-chart border-border-color" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Leave empty to post immediately
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button type="submit" className="bg-accent-blue hover:bg-accent-blue/90">
                        {socialForm.watch('scheduledAt') ? 'Schedule Post' : 'Post Now'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DashboardCard>
            </div>
            
            <DashboardCard title="Social Performance" className="h-full">
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={socialPerformanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {socialPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--bg-card)', 
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                      formatter={(value) => [`${value}%`, 'Engagement']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Platform Engagement</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm flex items-center">
                        <Instagram className="h-4 w-4 mr-1 text-accent-purple" />
                        Instagram
                      </span>
                      <span className="text-sm">45%</span>
                    </div>
                    <Progress value={45} className="h-1.5 bg-bg-chart" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm flex items-center">
                        <Facebook className="h-4 w-4 mr-1 text-accent-blue" />
                        Facebook
                      </span>
                      <span className="text-sm">30%</span>
                    </div>
                    <Progress value={30} className="h-1.5 bg-bg-chart" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm flex items-center">
                        <Twitter className="h-4 w-4 mr-1 text-accent-blue" />
                        Twitter
                      </span>
                      <span className="text-sm">25%</span>
                    </div>
                    <Progress value={25} className="h-1.5 bg-bg-chart" />
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>
          
          <DashboardCard title="Popular Hashtags" className="mt-6">
            <div className="flex flex-wrap gap-2">
              {[
                { tag: '#fooddelivery', count: 245 },
                { tag: '#localrestaurant', count: 187 },
                { tag: '#homemade', count: 156 },
                { tag: '#foodie', count: 342 },
                { tag: '#tasty', count: 289 },
                { tag: '#bestfood', count: 178 },
                { tag: '#restaurantlife', count: 134 },
                { tag: '#eatlocal', count: 221 },
                { tag: '#cheflife', count: 167 },
                { tag: '#foodstagram', count: 312 }
              ].map((hashtag) => (
                <Badge 
                  key={hashtag.tag} 
                  variant="secondary" 
                  className="bg-bg-chart text-text-secondary px-3 py-1.5"
                >
                  {hashtag.tag} <span className="ml-1 text-xs text-accent-blue">{hashtag.count}</span>
                </Badge>
              ))}
            </div>
          </DashboardCard>
          
          {/* Social Media Account Configuration */}
          <DashboardCard 
            title="Connected Social Media Accounts" 
            className="mt-6"
            action={
              <Button 
                size="sm" 
                className="bg-accent-blue hover:bg-accent-blue/90"
                onClick={() => {
                  setIsAddingAccount(true);
                  socialAccountForm.reset();
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Connect Account
              </Button>
            }
          >
            {isLoadingSocialAccounts ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-accent-blue border-t-transparent rounded-full" />
              </div>
            ) : socialAccounts.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mb-3 w-12 h-12 rounded-full bg-bg-chart flex items-center justify-center mx-auto">
                  <Share2 className="h-6 w-6 text-text-secondary" />
                </div>
                <h3 className="text-lg font-medium mb-1">No Connected Accounts</h3>
                <p className="text-text-secondary mb-4">
                  Connect your social media accounts to post content directly from SoZayn.
                </p>
                <Button 
                  className="bg-accent-blue hover:bg-accent-blue/90"
                  onClick={() => {
                    setIsAddingAccount(true);
                    socialAccountForm.reset();
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Connect an Account
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border-color">
                {socialAccounts.map((account: any) => (
                  <div key={account.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div className="flex items-center">
                      {account.platform === 'instagram' && <Instagram className="h-5 w-5 mr-3 text-accent-purple" />}
                      {account.platform === 'facebook' && <Facebook className="h-5 w-5 mr-3 text-accent-blue" />}
                      {account.platform === 'twitter' && <Twitter className="h-5 w-5 mr-3 text-accent-blue" />}
                      {account.platform === 'youtube' && <FaYoutube className="h-5 w-5 mr-3 text-red-500" />}
                      {account.platform === 'linkedin' && <FaLinkedin className="h-5 w-5 mr-3 text-blue-600" />}
                      {account.platform === 'tiktok' && <FaTiktok className="h-5 w-5 mr-3 text-black" />}
                      <div>
                        <p className="font-medium">{account.accountName}</p>
                        <p className="text-sm text-text-secondary capitalize">{account.platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {account.profileUrl && (
                        <a 
                          href={account.profileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-full hover:bg-bg-chart transition-colors"
                          title="View Profile"
                        >
                          <LinkIcon className="h-4 w-4 text-text-secondary" />
                        </a>
                      )}
                      <button 
                        className="p-2 rounded-full hover:bg-bg-chart transition-colors"
                        title="Remove Account"
                        onClick={() => deleteSocialAccountMutation.mutate(account.id)}
                      >
                        <X className="h-4 w-4 text-text-secondary" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add Social Media Account Dialog */}
            <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Connect Social Media Account</DialogTitle>
                  <DialogDescription>
                    Connect your social media account to post content directly from SoZayn.
                  </DialogDescription>
                </DialogHeader>
                <Form {...socialAccountForm}>
                  <form onSubmit={socialAccountForm.handleSubmit(onSocialAccountSubmit)} className="space-y-6">
                    <FormField
                      control={socialAccountForm.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform</FormLabel>
                          <div className="flex flex-wrap gap-4">
                            <div 
                              className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border ${field.value === 'instagram' ? 'border-accent-purple bg-accent-purple/10' : 'border-border-color'}`}
                              onClick={() => field.onChange('instagram')}
                            >
                              <Instagram className={`h-5 w-5 ${field.value === 'instagram' ? 'text-accent-purple' : 'text-text-secondary'}`} />
                            </div>
                            <div 
                              className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border ${field.value === 'facebook' ? 'border-accent-blue bg-accent-blue/10' : 'border-border-color'}`}
                              onClick={() => field.onChange('facebook')}
                            >
                              <Facebook className={`h-5 w-5 ${field.value === 'facebook' ? 'text-accent-blue' : 'text-text-secondary'}`} />
                            </div>
                            <div 
                              className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border ${field.value === 'twitter' ? 'border-accent-blue bg-accent-blue/10' : 'border-border-color'}`}
                              onClick={() => field.onChange('twitter')}
                            >
                              <Twitter className={`h-5 w-5 ${field.value === 'twitter' ? 'text-accent-blue' : 'text-text-secondary'}`} />
                            </div>
                            <div 
                              className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border ${field.value === 'youtube' ? 'border-red-500 bg-red-500/10' : 'border-border-color'}`}
                              onClick={() => field.onChange('youtube')}
                            >
                              <FaYoutube className={`h-5 w-5 ${field.value === 'youtube' ? 'text-red-500' : 'text-text-secondary'}`} />
                            </div>
                            <div 
                              className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border ${field.value === 'linkedin' ? 'border-blue-600 bg-blue-600/10' : 'border-border-color'}`}
                              onClick={() => field.onChange('linkedin')}
                            >
                              <FaLinkedin className={`h-5 w-5 ${field.value === 'linkedin' ? 'text-blue-600' : 'text-text-secondary'}`} />
                            </div>
                            <div 
                              className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border ${field.value === 'tiktok' ? 'border-black bg-black/10' : 'border-border-color'}`}
                              onClick={() => field.onChange('tiktok')}
                            >
                              <FaTiktok className={`h-5 w-5 ${field.value === 'tiktok' ? 'text-black' : 'text-text-secondary'}`} />
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={socialAccountForm.control}
                      name="accountName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter account name" 
                              className="bg-bg-chart border-border-color" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your username or handle for this platform
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={socialAccountForm.control}
                      name="profileUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile URL (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://..." 
                              className="bg-bg-chart border-border-color" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddingAccount(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-accent-blue hover:bg-accent-blue/90"
                        disabled={addSocialAccountMutation.isPending}
                      >
                        {addSocialAccountMutation.isPending ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                            Connecting...
                          </>
                        ) : 'Connect Account'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </DashboardCard>
        </TabsContent>
        
        {/* Email Marketing Tab */}
        <TabsContent value="email">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Subscribers"
              value={isLoadingSubscribers ? "..." : emailSubscribers.length?.toString() || emailStats.subscribers.toString()}
              icon={<Users className="h-4 w-4 text-accent-blue" />}
              change={12.5}
              progress={75}
              progressColor="bg-accent-blue"
            />
            
            <StatsCard
              title="Open Rate"
              value={`${emailStats.openRate}%`}
              icon={<Mail className="h-4 w-4 text-accent-green" />}
              change={1.2}
              progress={Math.round(emailStats.openRate * 3)}
              progressColor="bg-accent-green"
            />
            
            <StatsCard
              title="Click Rate"
              value={`${emailStats.clickRate}%`}
              icon={<ArrowRight className="h-4 w-4 text-accent-orange" />}
              change={0.8}
              progress={Math.round(emailStats.clickRate * 10)}
              progressColor="bg-accent-orange"
            />
            
            <StatsCard
              title="Campaigns"
              value={isLoadingCampaigns ? "..." : emailCampaignsList.length?.toString() || emailStats.campaigns.toString()}
              icon={<Megaphone className="h-4 w-4 text-accent-purple" />}
              change={5}
              progress={60}
              progressColor="bg-accent-purple"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <DashboardCard title="MailerLite Integration" className="h-full">
                <div className="space-y-4">
                  <div className="p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
                    <h3 className="font-medium flex items-center text-accent-blue mb-2">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Marketing with MailerLite
                    </h3>
                    <p className="text-sm text-text-secondary mb-2">
                      SoZayn is integrated with MailerLite, allowing you to manage subscribers, create campaigns, 
                      and automate your email marketing. Add subscribers below or import them directly from your customer database.
                    </p>
                  </div>
                
                  <Form {...emailSubscriberForm}>
                    <form onSubmit={emailSubscriberForm.handleSubmit(onEmailSubscriberSubmit)} className="space-y-4">
                      <FormField
                        control={emailSubscriberForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="customer@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailSubscriberForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="bg-accent-blue hover:bg-accent-blue/90"
                        disabled={addSubscriberMutation.isPending}
                      >
                        {addSubscriberMutation.isPending ? "Adding..." : "Add Subscriber"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </DashboardCard>
            </div>
            
            <DashboardCard title="Email Automations" className="h-full">
              <div className="space-y-4">
                <div className="p-4 border border-border-color rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Welcome Email</h3>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-sm text-text-secondary">
                    Automatically send a welcome email to new customers
                  </p>
                </div>
                
                <div className="p-4 border border-border-color rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Order Confirmation</h3>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-sm text-text-secondary">
                    Send confirmation emails after every order
                  </p>
                </div>
                
                <div className="p-4 border border-border-color rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Abandoned Cart</h3>
                    <Switch />
                  </div>
                  <p className="text-sm text-text-secondary">
                    Remind customers about items left in cart
                  </p>
                </div>
                
                <div className="p-4 border border-border-color rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Monthly Newsletter</h3>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-sm text-text-secondary">
                    Send monthly updates and special offers
                  </p>
                </div>
              </div>
            </DashboardCard>
          </div>
          
          <DashboardCard title="Subscriber Management">
            <div className="mb-4 flex items-center justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
                <Input 
                  type="search" 
                  placeholder="Search subscribers..." 
                  className="pl-9 bg-bg-chart border-border-color w-full"
                />
              </div>
              
              <Button variant="outline" className="ml-2">
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Import Subscribers</span>
              </Button>
            </div>
            
            <div className="rounded-md border border-border-color">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSubscribers ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Loading subscribers...
                      </TableCell>
                    </TableRow>
                  ) : emailSubscribers && emailSubscribers.length > 0 ? (
                    emailSubscribers.map((subscriber: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell>{subscriber.name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-600/20">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(subscriber.created_at || Date.now()).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Edit</span>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No subscribers found. Add your first subscriber above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </DashboardCard>
          
          <DashboardCard title="Recent Email Campaigns" className="mt-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>Opens</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingCampaigns ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Loading campaigns...
                    </TableCell>
                  </TableRow>
                ) : emailCampaignsList && emailCampaignsList.length > 0 ? (
                  emailCampaignsList.map((campaign: any) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>{campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{campaign.opens || 0}</TableCell>
                      <TableCell>{campaign.clicks || 0}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            campaign.status === 'completed' 
                              ? 'bg-accent-green/20 text-accent-green' 
                              : 'bg-accent-blue/20 text-accent-blue'
                          }
                        >
                          {campaign.status === 'completed' ? 'Sent' : 'Scheduled'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No campaigns found. Create your first campaign.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            <div className="flex justify-between items-center mt-6">
              <Button variant="outline" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Create New Campaign
              </Button>
              
              <Button variant="link" className="text-accent-blue">
                View All Campaigns
              </Button>
            </div>
          </DashboardCard>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <DashboardCard title="Email Performance" className="h-full">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart
                    data={[
                      { name: 'Jan', opens: 22.1, clicks: 4.3 },
                      { name: 'Feb', opens: 21.8, clicks: 4.1 },
                      { name: 'Mar', opens: 24.5, clicks: 4.8 },
                      { name: 'Apr', opens: 23.9, clicks: 4.6 },
                      { name: 'May', opens: 23.4, clicks: 4.7 },
                      { name: 'Jun', opens: 24.2, clicks: 5.1 }
                    ]}
                  >
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
                      formatter={(value) => [`${value}%`, '']}
                    />
                    <Bar dataKey="opens" fill="var(--accent-green)" name="Open Rate" />
                    <Bar dataKey="clicks" fill="var(--accent-orange)" name="Click Rate" />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
            
            <DashboardCard title="Subscriber Growth" className="h-full">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { name: 'Jan', subscribers: 2650 },
                      { name: 'Feb', subscribers: 2780 },
                      { name: 'Mar', subscribers: 2920 },
                      { name: 'Apr', subscribers: 3050 },
                      { name: 'May', subscribers: 3180 },
                      { name: 'Jun', subscribers: 3240 }
                    ]}
                  >
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
                    <Line 
                      type="monotone" 
                      dataKey="subscribers" 
                      stroke="var(--accent-blue)" 
                      strokeWidth={2}
                      dot={{ fill: 'var(--accent-blue)', r: 4 }}
                      activeDot={{ r: 6, fill: 'var(--accent-blue)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
