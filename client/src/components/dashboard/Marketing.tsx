import { useState, useEffect } from 'react';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/ui/stats';
import { useAuth } from '@/hooks/useAuth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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

// ExtendedDashboardCard component to support action prop
interface ExtendedDashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

const ExtendedDashboardCard = ({ title, children, className, action }: ExtendedDashboardCardProps) => {
  return (
    <DashboardCard title={title} className={className}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        {action}
      </div>
      {children}
    </DashboardCard>
  );
};

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
  const { user, hasRequiredPlan } = useAuth();
  
  // Check if user has access to advanced marketing features
  const hasAdvancedSEO = hasRequiredPlan(['professional', 'enterprise']);
  const hasSocialMediaIntegration = hasRequiredPlan(['growth', 'professional', 'enterprise']);
  const hasEmailCampaigns = hasRequiredPlan(['growth', 'professional', 'enterprise']);
  
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
          {!hasAdvancedSEO && (
            <div className="mb-6 p-4 border border-accent-orange/30 bg-accent-orange/10 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-accent-orange mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-accent-orange mb-1">Limited SEO Features</h3>
                  <p className="text-sm text-text-secondary mb-2">
                    Your current plan includes basic SEO tools. Upgrade to Professional for advanced keyword tracking, competitor analysis, and automated SEO recommendations.
                  </p>
                  <Button asChild size="sm" className="bg-accent-orange hover:bg-accent-orange/90">
                    <a href="/subscribe">Upgrade to Professional</a>
                  </Button>
                </div>
              </div>
            </div>
          )}
          
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
                          backgroundColor: 'var(--bg-chart)', 
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="visitors" 
                        stroke="var(--accent-blue)" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: 'var(--accent-blue)' }}
                        activeDot={{ r: 6, fill: 'var(--accent-blue)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </DashboardCard>
            </div>
            <div>
              <DashboardCard title="Traffic Sources" className="h-full">
                <div className="py-4">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={trafficSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
                      >
                        {trafficSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </DashboardCard>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <DashboardCard title="SEO Settings" className="h-full">
              <Form {...seoForm}>
                <form onSubmit={seoForm.handleSubmit(onSEOSubmit)} className="space-y-4">
                  <FormField
                    control={seoForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Optimal length: 50-60 characters
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={seoForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormDescription>
                          Optimal length: 150-160 characters
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={seoForm.control}
                    name="keywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keywords</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Separate keywords with commas
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={seoForm.control}
                      name="trackingEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border border-border-color rounded-md">
                          <div>
                            <FormLabel className="mb-1 cursor-pointer">Analytics Tracking</FormLabel>
                            <FormDescription className="text-xs">
                              Enable website analytics
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={seoForm.control}
                      name="sitemapEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border border-border-color rounded-md">
                          <div>
                            <FormLabel className="mb-1 cursor-pointer">XML Sitemap</FormLabel>
                            <FormDescription className="text-xs">
                              Generate XML sitemap
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={seoForm.control}
                      name="metaTagsEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-3 border border-border-color rounded-md">
                          <div>
                            <FormLabel className="mb-1 cursor-pointer">Meta Tags</FormLabel>
                            <FormDescription className="text-xs">
                              Generate meta tags
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit">Save SEO Settings</Button>
                </form>
              </Form>
            </DashboardCard>
            
            <DashboardCard title="SEO Recommendations" className="h-full">
              <div className="space-y-3">
                <div className="p-3 border border-accent-green/30 bg-accent-green/10 rounded-lg flex items-start gap-3">
                  <Check className="h-5 w-5 text-accent-green mt-0.5" />
                  <div>
                    <p className="font-medium">Good meta description length</p>
                    <p className="text-sm text-text-secondary">Your meta description is within the recommended length.</p>
                  </div>
                </div>
                
                <div className="p-3 border border-accent-green/30 bg-accent-green/10 rounded-lg flex items-start gap-3">
                  <Check className="h-5 w-5 text-accent-green mt-0.5" />
                  <div>
                    <p className="font-medium">Proper use of keywords</p>
                    <p className="text-sm text-text-secondary">Keywords are used effectively in your content.</p>
                  </div>
                </div>
                
                <div className="p-3 border border-accent-orange/30 bg-accent-orange/10 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-accent-orange mt-0.5" />
                  <div>
                    <p className="font-medium">Improve page loading speed</p>
                    <p className="text-sm text-text-secondary">Consider optimizing images and reducing server response time.</p>
                  </div>
                </div>
                
                {hasAdvancedSEO ? (
                  <>
                    <div className="p-3 border border-accent-orange/30 bg-accent-orange/10 rounded-lg flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-accent-orange mt-0.5" />
                      <div>
                        <p className="font-medium">Add more backlinks</p>
                        <p className="text-sm text-text-secondary">Increase the number of quality backlinks to improve domain authority.</p>
                      </div>
                    </div>
                    
                    <div className="p-3 border border-accent-orange/30 bg-accent-orange/10 rounded-lg flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-accent-orange mt-0.5" />
                      <div>
                        <p className="font-medium">Improve mobile responsiveness</p>
                        <p className="text-sm text-text-secondary">Optimize your site for mobile devices to improve rankings.</p>
                      </div>
                    </div>
                    
                    <Button className="w-full">Run Advanced SEO Audit</Button>
                  </>
                ) : (
                  <div className="p-3 border border-accent-blue/20 bg-accent-blue/5 rounded-lg mt-4">
                    <p className="text-sm text-text-secondary">Upgrade to Professional plan to access advanced SEO recommendations and automated audits.</p>
                    <Button asChild size="sm" className="mt-2 bg-accent-blue hover:bg-accent-blue/90">
                      <a href="/subscribe">Upgrade Plan</a>
                    </Button>
                  </div>
                )}
              </div>
            </DashboardCard>
          </div>
        </TabsContent>
        
        {/* Social Media Tab */}
        <TabsContent value="social">
          {!hasSocialMediaIntegration ? (
            <AlertDialog defaultOpen>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Upgrade Your Plan</AlertDialogTitle>
                  <AlertDialogDescription>
                    Social media integration requires a Growth plan or higher. Upgrade now to schedule posts, track social media performance, and engage with your audience.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Maybe Later</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button asChild>
                      <a href="/subscribe">Upgrade Now</a>
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Followers"
              value={socialStats.followers.toString()}
              icon={<Users className="h-4 w-4 text-accent-blue" />}
              change={8.3}
              progress={70}
              progressColor="bg-accent-blue"
            />
            
            <StatsCard
              title="Engagement Rate"
              value={`${socialStats.engagement}%`}
              icon={<Share2 className="h-4 w-4 text-accent-green" />}
              change={1.5}
              progress={62}
              progressColor="bg-accent-green"
            />
            
            <StatsCard
              title="Posts"
              value={socialStats.posts.toString()}
              icon={<Instagram className="h-4 w-4 text-accent-purple" />}
              change={4.2}
              progress={45}
              progressColor="bg-accent-purple"
            />
            
            <StatsCard
              title="Link Clicks"
              value={socialStats.clicks.toString()}
              icon={<ArrowRight className="h-4 w-4 text-accent-orange" />}
              change={12.8}
              progress={68}
              progressColor="bg-accent-orange"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-3">
              <DashboardCard title="Create Social Media Post" className="h-full">
                <Form {...socialForm}>
                  <form onSubmit={socialForm.handleSubmit(onSocialSubmit)} className="space-y-4">
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
                          <FormMessage />
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
                              className="min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
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
                              placeholder="https://..." 
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
                          <FormLabel>Schedule Post (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit"
                        className="bg-accent-blue hover:bg-accent-blue/90"
                      >
                        {socialForm.getValues('scheduledAt') ? 'Schedule Post' : 'Post Now'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DashboardCard>
            </div>
            
            <div className="md:col-span-2">
              <DashboardCard title="Platform Performance" className="h-full">
                <div className="py-4">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={socialPerformanceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
                      >
                        {socialPerformanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Platform</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead>Growth</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Instagram</TableCell>
                        <TableCell>45%</TableCell>
                        <TableCell className="text-accent-green">+5.2%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Facebook</TableCell>
                        <TableCell>30%</TableCell>
                        <TableCell className="text-accent-green">+2.1%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Twitter</TableCell>
                        <TableCell>25%</TableCell>
                        <TableCell className="text-accent-red">-1.3%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </DashboardCard>
            </div>
          </div>
          
          {/* Social Media Account Configuration */}
          <ExtendedDashboardCard 
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
          </ExtendedDashboardCard>
        </TabsContent>
        
        {/* Email Marketing Tab */}
        <TabsContent value="email">
          {!hasEmailCampaigns ? (
            <AlertDialog defaultOpen>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Upgrade Your Plan</AlertDialogTitle>
                  <AlertDialogDescription>
                    Email marketing campaigns require a Growth plan or higher. Upgrade now to send automated emails, track analytics, and grow your subscriber list.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Maybe Later</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button asChild>
                      <a href="/subscribe">Upgrade Now</a>
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
          
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
                        {addSubscriberMutation.isPending ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                            Adding...
                          </>
                        ) : 'Add Subscriber'}
                      </Button>
                    </form>
                  </Form>
                </div>
              </DashboardCard>
            </div>
            
            <div>
              <ExtendedDashboardCard 
                title="Email Campaigns" 
                className="h-full"
                action={
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-accent-blue hover:bg-accent-blue/90">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        New Campaign
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Create Email Campaign</DialogTitle>
                        <DialogDescription>
                          Set up a new email campaign to send to your subscribers.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...emailCampaignForm}>
                        <form onSubmit={emailCampaignForm.handleSubmit(onEmailCampaignSubmit)} className="space-y-4">
                          <FormField
                            control={emailCampaignForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Campaign Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Monthly Newsletter" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={emailCampaignForm.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Subject</FormLabel>
                                <FormControl>
                                  <Input placeholder="New specials this month!" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={emailCampaignForm.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Content</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Write your email content here..." 
                                    className="min-h-[150px]" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={emailCampaignForm.control}
                            name="scheduledFor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Schedule (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="datetime-local" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  Leave empty to save as draft
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => {}}>
                              Cancel
                            </Button>
                            <Button 
                              type="submit"
                              className="bg-accent-blue hover:bg-accent-blue/90"
                            >
                              Create Campaign
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                }
              >
                {isLoadingCampaigns ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin w-8 h-8 border-4 border-accent-blue border-t-transparent rounded-full" />
                  </div>
                ) : emailCampaignsList.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="mb-3 w-12 h-12 rounded-full bg-bg-chart flex items-center justify-center mx-auto">
                      <Mail className="h-6 w-6 text-text-secondary" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No Campaigns</h3>
                    <p className="text-text-secondary mb-4">
                      Create your first email campaign to start engaging with your audience.
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-accent-blue hover:bg-accent-blue/90">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Campaign
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        {/* Dialog content as above */}
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="divide-y divide-border-color">
                    {emailCampaigns.map((campaign) => (
                      <div key={campaign.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div>
                              <p className="font-medium">{campaign.name}</p>
                              <p className="text-sm text-text-secondary">
                                {campaign.status === 'scheduled' ? (
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Scheduled: {campaign.sent}
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <Mail className="h-3 w-3 mr-1" />
                                    Sent: {campaign.sent}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {campaign.status === 'completed' ? (
                              <Badge variant="outline" className="bg-accent-green/10 text-accent-green border-accent-green/30">
                                Sent
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-accent-blue/10 text-accent-blue border-accent-blue/30">
                                Scheduled
                              </Badge>
                            )}
                          </div>
                        </div>
                        {campaign.status === 'completed' && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="text-sm">
                              <span className="text-text-secondary">Opens:</span>{" "}
                              <span className="font-medium">{campaign.opens}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-text-secondary">Clicks:</span>{" "}
                              <span className="font-medium">{campaign.clicks}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ExtendedDashboardCard>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <DashboardCard title="Recent Subscribers" className="h-full">
              {isLoadingSubscribers ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin w-8 h-8 border-4 border-accent-blue border-t-transparent rounded-full" />
                </div>
              ) : emailSubscribers.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-text-secondary">No subscribers yet. Add your first subscriber using the form above.</p>
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Date Subscribed</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Loop through subscribers */}
                      {emailSubscribers.slice(0, 5).map((subscriber: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{subscriber.email}</TableCell>
                          <TableCell>{subscriber.name || '-'}</TableCell>
                          <TableCell>{subscriber.created_at ? new Date(subscriber.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-accent-green/10 text-accent-green border-accent-green/30">
                              Active
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {/* If emailSubscribers is empty, show demo data */}
                      {emailSubscribers.length === 0 && (
                        <>
                          <TableRow>
                            <TableCell className="font-medium">john@example.com</TableCell>
                            <TableCell>John Doe</TableCell>
                            <TableCell>2023-06-10</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-accent-green/10 text-accent-green border-accent-green/30">
                                Active
                              </Badge>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">sarah@example.com</TableCell>
                            <TableCell>Sarah Johnson</TableCell>
                            <TableCell>2023-06-08</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-accent-green/10 text-accent-green border-accent-green/30">
                                Active
                              </Badge>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">mike@example.com</TableCell>
                            <TableCell>Mike Smith</TableCell>
                            <TableCell>2023-06-05</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-accent-orange/10 text-accent-orange border-accent-orange/30">
                                Bounced
                              </Badge>
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </DashboardCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}