import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { StatsCard } from '@/components/ui/stats';
import { 
  Share2, 
  Instagram, 
  Facebook, 
  Twitter, 
  Users, 
  MessageSquare, 
  MousePointer, 
  Calendar,
  Link as LinkIcon,
  ExternalLink,
  Plus,
  Image,
  BarChart
} from 'lucide-react';
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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const socialPostSchema = z.object({
  platform: z.enum(['instagram', 'facebook', 'twitter']),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
  imageUrl: z.string().optional(),
  scheduledAt: z.string().optional(),
});

type SocialPostFormValues = z.infer<typeof socialPostSchema>;

export default function SocialMediaPage() {
  const [activeTab, setActiveTab] = useState('accounts');
  const { toast } = useToast();
  
  // Social media stats
  const socialStats = {
    followers: 4580,
    engagement: 6.2,
    posts: 124,
    clicks: 840
  };
  
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
  
  // Connected accounts
  const connectedAccounts = [
    { id: 1, platform: 'instagram', handle: '@ourrestaurant', connected: true, followers: 2450, engagement: 4.8 },
    { id: 2, platform: 'facebook', handle: 'Our Restaurant', connected: true, followers: 1850, engagement: 3.2 },
    { id: 3, platform: 'twitter', handle: '@ourrestaurant', connected: false, followers: 0, engagement: 0 },
  ];
  
  // Recent posts
  const recentPosts = [
    { 
      id: 1, 
      platform: 'instagram', 
      content: 'Try our new summer menu items! Fresh and delicious options for the hot weather.', 
      posted: '2023-06-15', 
      likes: 248, 
      comments: 42,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=300&auto=format&fit=crop'
    },
    { 
      id: 2, 
      platform: 'facebook', 
      content: 'Happy hour is back! Join us every weekday from 4-6pm for special prices on drinks and appetizers.', 
      posted: '2023-06-10', 
      likes: 187, 
      comments: 28,
      image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=300&auto=format&fit=crop'
    },
    { 
      id: 3, 
      platform: 'instagram', 
      content: 'Behind the scenes with our chef preparing tonight\'s special!', 
      posted: '2023-06-05', 
      likes: 321, 
      comments: 56,
      image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=300&auto=format&fit=crop'
    },
  ];
  
  // Scheduled posts
  const scheduledPosts = [
    { 
      id: 1, 
      platform: 'instagram', 
      content: 'Announcing our weekend special - family meal deals!', 
      scheduled: '2023-06-30 12:00', 
      status: 'scheduled',
      image: 'https://images.unsplash.com/photo-1547592180-85f173990888?q=80&w=300&auto=format&fit=crop'
    },
    { 
      id: 2, 
      platform: 'facebook', 
      content: 'Join us for our upcoming wine tasting event this Saturday.', 
      scheduled: '2023-06-25 10:00', 
      status: 'scheduled',
      image: null
    }
  ];
  
  // Social media performance data
  const socialPerformanceData = [
    { name: 'Instagram', value: 45 },
    { name: 'Facebook', value: 30 },
    { name: 'Twitter', value: 25 },
  ];
  
  const COLORS = ['#4361ee', '#3b5998', '#00acee'];
  
  // Engagement data
  const engagementData = [
    { name: 'Mon', instagram: 42, facebook: 28 },
    { name: 'Tue', instagram: 38, facebook: 25 },
    { name: 'Wed', instagram: 55, facebook: 32 },
    { name: 'Thu', instagram: 47, facebook: 35 },
    { name: 'Fri', instagram: 62, facebook: 45 },
    { name: 'Sat', instagram: 78, facebook: 58 },
    { name: 'Sun', instagram: 65, facebook: 47 },
  ];
  
  const onSocialSubmit = (data: SocialPostFormValues) => {
    console.log('Social post scheduled:', data);
    toast({
      title: "Post scheduled",
      description: `Your ${data.platform} post has been scheduled successfully.`,
    });
    socialForm.reset();
  };
  
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-5 w-5 text-[#C13584]" />;
      case 'facebook':
        return <Facebook className="h-5 w-5 text-[#3b5998]" />;
      case 'twitter':
        return <Twitter className="h-5 w-5 text-[#00acee]" />;
      default:
        return <Share2 className="h-5 w-5" />;
    }
  };
  
  const connectAccount = (platform: string) => {
    toast({
      title: `Connect ${platform}`,
      description: `Redirecting to ${platform} to connect your account...`,
    });
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">Social Media Integration</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Total Followers"
            value={socialStats.followers.toString()}
            icon={<Users className="h-4 w-4 text-accent-blue" />}
            change={23.5}
            progress={70}
            progressColor="bg-accent-blue"
          />
          
          <StatsCard
            title="Engagement Rate"
            value={`${socialStats.engagement}%`}
            icon={<MessageSquare className="h-4 w-4 text-accent-purple" />}
            change={1.8}
            progress={62}
            progressColor="bg-accent-purple"
          />
          
          <StatsCard
            title="Total Posts"
            value={socialStats.posts.toString()}
            icon={<Share2 className="h-4 w-4 text-accent-green" />}
            change={8.4}
            progress={75}
            progressColor="bg-accent-green"
          />
          
          <StatsCard
            title="Link Clicks"
            value={socialStats.clicks.toString()}
            icon={<MousePointer className="h-4 w-4 text-accent-orange" />}
            change={15.2}
            progress={68}
            progressColor="bg-accent-orange"
          />
        </div>
        
        <Tabs defaultValue="accounts" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Accounts</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span>Recent Posts</span>
            </TabsTrigger>
            <TabsTrigger value="publish" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Publish</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Accounts Tab */}
          <TabsContent value="accounts">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {connectedAccounts.map((account) => (
                <Card key={account.id} className="bg-bg-card border-border-color">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {getPlatformIcon(account.platform)}
                        <div>
                          <CardTitle className="text-base capitalize">{account.platform}</CardTitle>
                          <CardDescription className="text-xs">{account.handle}</CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant={account.connected ? "default" : "outline"}
                        className={account.connected ? "bg-accent-green" : "border-accent-orange text-accent-orange"}
                      >
                        {account.connected ? 'Connected' : 'Not Connected'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {account.connected ? (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-text-secondary">Followers</p>
                          <p className="font-semibold">{account.followers.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-text-secondary">Engagement</p>
                          <p className="font-semibold">{account.engagement}%</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-text-secondary">
                        Connect your {account.platform} account to manage posts and view analytics.
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-1">
                    {account.connected ? (
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-accent-blue hover:bg-accent-blue/90" 
                        size="sm" 
                        onClick={() => connectAccount(account.platform)}
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Connect Account
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <DashboardCard title="Engagement by Day" className="h-full">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={engagementData}>
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
                          dataKey="instagram" 
                          stroke="#C13584" 
                          strokeWidth={2}
                          dot={{ fill: '#C13584', r: 4 }}
                          activeDot={{ r: 6, fill: '#C13584' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="facebook" 
                          stroke="#3b5998" 
                          strokeWidth={2}
                          dot={{ fill: '#3b5998', r: 4 }}
                          activeDot={{ r: 6, fill: '#3b5998' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </DashboardCard>
              </div>
              
              <DashboardCard title="Audience Distribution" className="h-full">
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
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
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
          
          {/* Posts Tab */}
          <TabsContent value="posts">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Recent Posts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentPosts.map((post) => (
                  <Card key={post.id} className="bg-bg-card border-border-color">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(post.platform)}
                        <CardTitle className="text-sm capitalize">{post.platform}</CardTitle>
                        <CardDescription className="text-xs ml-auto">{post.posted}</CardDescription>
                      </div>
                    </CardHeader>
                    {post.image && (
                      <div className="px-6">
                        <img 
                          src={post.image} 
                          alt={`Post on ${post.platform}`}
                          className="w-full h-40 object-cover rounded-md"
                        />
                      </div>
                    )}
                    <CardContent className="py-3">
                      <p className="text-sm">{post.content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between py-2 border-t border-border-color">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1.5 text-text-secondary" />
                          <span>{post.comments}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1.5 text-text-secondary" />
                          <span>{post.likes}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              <h3 className="text-lg font-medium mt-8">Scheduled Posts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {scheduledPosts.map((post) => (
                  <Card key={post.id} className="bg-bg-card border-border-color">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(post.platform)}
                        <CardTitle className="text-sm capitalize">{post.platform}</CardTitle>
                        <Badge variant="outline" className="ml-auto">
                          {post.scheduled}
                        </Badge>
                      </div>
                    </CardHeader>
                    {post.image && (
                      <div className="px-6">
                        <img 
                          src={post.image} 
                          alt={`Post on ${post.platform}`}
                          className="w-full h-40 object-cover rounded-md"
                        />
                      </div>
                    )}
                    <CardContent className="py-3">
                      <p className="text-sm">{post.content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 py-2 border-t border-border-color">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        Cancel
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                
                <Card className="bg-bg-card border-border-color border-dashed flex flex-col items-center justify-center p-6">
                  <Plus className="h-8 w-8 text-text-secondary mb-2" />
                  <p className="text-text-secondary text-sm text-center">
                    Create a new scheduled post
                  </p>
                  <Button 
                    className="mt-4 bg-accent-blue hover:bg-accent-blue/90" 
                    size="sm"
                    onClick={() => setActiveTab('publish')}
                  >
                    Create Post
                  </Button>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Publish Tab */}
          <TabsContent value="publish">
            <DashboardCard title="Create Social Media Post">
              <Form {...socialForm}>
                <form onSubmit={socialForm.handleSubmit(onSocialSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={socialForm.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-bg-chart border-border-color">
                                <SelectValue placeholder="Select platform" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="twitter">Twitter</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose which platform to post to
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={socialForm.control}
                      name="scheduledAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schedule for (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              className="bg-bg-chart border-border-color"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            When to publish this post (leave empty to post now)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="md:col-span-2">
                      <FormField
                        control={socialForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Post Content</FormLabel>
                            <FormControl>
                              <Textarea 
                                rows={5} 
                                className="bg-bg-chart border-border-color" 
                                placeholder="What would you like to share?"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Your post text content
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <FormField
                        control={socialForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL (Optional)</FormLabel>
                            <FormControl>
                              <div className="flex space-x-2">
                                <Input 
                                  className="bg-bg-chart border-border-color flex-grow" 
                                  placeholder="https://example.com/image.jpg"
                                  {...field} 
                                />
                                <Button type="button" variant="outline">
                                  <Image className="h-4 w-4 mr-2" />
                                  Upload
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Add an image to your post
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
                      <Share2 className="mr-2 h-4 w-4" />
                      {socialForm.watch('scheduledAt') ? 'Schedule Post' : 'Post Now'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DashboardCard>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}