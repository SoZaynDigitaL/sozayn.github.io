import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatsCard } from '@/components/ui/stats';
import { 
  Globe, 
  Search, 
  TrendingUp, 
  Link as LinkIcon, 
  ExternalLink, 
  List,
  ListChecks,
  KeyRound,
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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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

export default function SEOPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('keywords');
  
  // SEO stats
  const seoStats = {
    organicVisits: 12548,
    rankings: 32,
    organicConversion: 3.8,
    backlinks: 217
  };
  
  // Keyword data
  const keywords = [
    { 
      id: 1, 
      keyword: 'restaurant near me', 
      position: 3, 
      change: 2, 
      volume: 6500, 
      difficulty: 65,
      status: 'ranking'
    },
    { 
      id: 2, 
      keyword: 'best italian food', 
      position: 8, 
      change: -1, 
      volume: 2800, 
      difficulty: 72,
      status: 'ranking' 
    },
    { 
      id: 3, 
      keyword: 'pizza delivery', 
      position: 15, 
      change: 5, 
      volume: 8900, 
      difficulty: 85,
      status: 'ranking' 
    },
    { 
      id: 4, 
      keyword: 'family restaurant', 
      position: 24, 
      change: 0, 
      volume: 1200, 
      difficulty: 45,
      status: 'ranking' 
    },
    { 
      id: 5, 
      keyword: 'gluten free options', 
      position: 0, 
      change: 0, 
      volume: 2300, 
      difficulty: 55,
      status: 'tracking' 
    }
  ];
  
  // Pages data
  const pages = [
    { 
      id: 1, 
      title: 'Home Page', 
      url: '/', 
      score: 92, 
      issues: 2, 
      organicTraffic: 560,
      titles: true,
      meta: true,
      headings: true,
      images: false,
      content: true
    },
    { 
      id: 2, 
      title: 'Menu Page', 
      url: '/menu', 
      score: 85, 
      issues: 3, 
      organicTraffic: 420,
      titles: true,
      meta: true,
      headings: true,
      images: true,
      content: false
    },
    { 
      id: 3, 
      title: 'About Us', 
      url: '/about', 
      score: 68, 
      issues: 5, 
      organicTraffic: 190,
      titles: true,
      meta: false,
      headings: true,
      images: false,
      content: true
    },
    { 
      id: 4, 
      title: 'Contact Page', 
      url: '/contact', 
      score: 78, 
      issues: 4, 
      organicTraffic: 280,
      titles: true,
      meta: false,
      headings: true,
      images: true,
      content: true
    }
  ];
  
  // Backlink data
  const backlinks = [
    { 
      id: 1, 
      domain: 'foodblog.com', 
      url: 'https://foodblog.com/best-restaurants', 
      anchor: 'amazing italian cuisine', 
      authority: 65,
      dofollow: true
    },
    { 
      id: 2, 
      domain: 'cityguide.org', 
      url: 'https://cityguide.org/dining', 
      anchor: 'local favorite', 
      authority: 72,
      dofollow: true
    },
    { 
      id: 3, 
      domain: 'newspaper.com', 
      url: 'https://newspaper.com/food-review', 
      anchor: 'restaurant review', 
      authority: 88,
      dofollow: false
    },
    { 
      id: 4, 
      domain: 'magazine.net', 
      url: 'https://magazine.net/top-10-places', 
      anchor: 'click here', 
      authority: 54,
      dofollow: true
    }
  ];
  
  // Traffic data
  const trafficData = [
    { date: 'Jan', organic: 580, direct: 400, referral: 180 },
    { date: 'Feb', organic: 620, direct: 420, referral: 210 },
    { date: 'Mar', organic: 750, direct: 450, referral: 240 },
    { date: 'Apr', organic: 820, direct: 480, referral: 260 },
    { date: 'May', organic: 950, direct: 520, referral: 290 },
    { date: 'Jun', organic: 1120, direct: 560, referral: 320 },
  ];
  
  // Keyword form
  const keywordForm = useForm({
    defaultValues: {
      keyword: '',
    }
  });
  
  const onKeywordSubmit = (data: { keyword: string }) => {
    toast({
      title: "Keyword added",
      description: `"${data.keyword}" has been added to tracking.`,
    });
    keywordForm.reset();
  };
  
  // Meta tags form
  const metaTagsForm = useForm({
    defaultValues: {
      url: '',
      title: '',
      description: '',
      keywords: '',
    }
  });
  
  const onMetaTagsSubmit = (data: any) => {
    toast({
      title: "Meta tags updated",
      description: `Meta tags for "${data.url}" have been updated.`,
    });
    metaTagsForm.reset();
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">SEO Management</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Organic Visits"
            value={seoStats.organicVisits.toString()}
            icon={<Globe className="h-4 w-4 text-accent-blue" />}
            change={15.8}
            progress={78}
            progressColor="bg-accent-blue"
          />
          
          <StatsCard
            title="Keyword Rankings"
            value={seoStats.rankings.toString()}
            icon={<TrendingUp className="h-4 w-4 text-accent-green" />}
            change={4}
            progress={65}
            progressColor="bg-accent-green"
          />
          
          <StatsCard
            title="Conversion Rate"
            value={`${seoStats.organicConversion}%`}
            icon={<Search className="h-4 w-4 text-accent-orange" />}
            change={0.8}
            progress={38}
            progressColor="bg-accent-orange"
          />
          
          <StatsCard
            title="Backlinks"
            value={seoStats.backlinks.toString()}
            icon={<LinkIcon className="h-4 w-4 text-accent-purple" />}
            change={26}
            progress={72}
            progressColor="bg-accent-purple"
          />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <DashboardCard title="Organic Traffic Trend">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
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
                    dataKey="organic" 
                    stroke="var(--accent-blue)" 
                    strokeWidth={2}
                    dot={{ fill: 'var(--accent-blue)', r: 4 }}
                    activeDot={{ r: 6, fill: 'var(--accent-blue)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="direct" 
                    stroke="var(--accent-purple)" 
                    strokeWidth={2}
                    dot={{ fill: 'var(--accent-purple)', r: 4 }}
                    activeDot={{ r: 6, fill: 'var(--accent-purple)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="referral" 
                    stroke="var(--accent-green)" 
                    strokeWidth={2}
                    dot={{ fill: 'var(--accent-green)', r: 4 }}
                    activeDot={{ r: 6, fill: 'var(--accent-green)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <DashboardCard title="Keyword Rankings" className="h-full">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Search Volume</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywords.map((keyword) => (
                      <TableRow key={keyword.id}>
                        <TableCell className="font-medium">{keyword.keyword}</TableCell>
                        <TableCell>
                          {keyword.position > 0 ? keyword.position : '-'}
                        </TableCell>
                        <TableCell>
                          {keyword.change !== 0 && (
                            <span className={keyword.change > 0 ? 'text-accent-green' : 'text-red-500'}>
                              {keyword.change > 0 ? `+${keyword.change}` : keyword.change}
                            </span>
                          )}
                          {keyword.change === 0 && <span>-</span>}
                        </TableCell>
                        <TableCell>{keyword.volume.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={keyword.difficulty} className="h-2 w-24" />
                            <span>{keyword.difficulty}/100</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={keyword.status === 'ranking' ? 'default' : 'outline'}
                            className={keyword.status === 'ranking' ? 'bg-accent-green' : 'border-accent-blue text-accent-blue'}
                          >
                            {keyword.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-4">
                  <form onSubmit={keywordForm.handleSubmit(onKeywordSubmit)} className="flex gap-2">
                    <Input 
                      placeholder="Add keyword to track..." 
                      className="bg-bg-chart border-border-color"
                      {...keywordForm.register('keyword', { required: true })}
                    />
                    <Button type="submit" className="bg-accent-blue hover:bg-accent-blue/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </form>
                </div>
              </div>
            </DashboardCard>
          </div>
          
          <DashboardCard title="Competitor Analysis" className="h-full">
            <div className="space-y-4">
              <div>
                <p className="font-medium">Top Competitors</p>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-accent-blue mr-2"></div>
                      <span>competitor1.com</span>
                    </div>
                    <Badge>85 keywords</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-accent-green mr-2"></div>
                      <span>competitor2.com</span>
                    </div>
                    <Badge>64 keywords</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-accent-orange mr-2"></div>
                      <span>competitor3.com</span>
                    </div>
                    <Badge>57 keywords</Badge>
                  </li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">Keyword Gap</p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>"italian catering"</span>
                    <Badge variant="outline" className="border-accent-blue text-accent-blue">opportunity</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>"pasta delivery"</span>
                    <Badge variant="outline" className="border-accent-blue text-accent-blue">opportunity</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>"family dining"</span>
                    <Badge variant="outline" className="border-accent-blue text-accent-blue">opportunity</Badge>
                  </div>
                </div>
              </div>
              
              <Button className="w-full" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                View Full Competitor Analysis
              </Button>
            </div>
          </DashboardCard>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Site Audit">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{page.title}</div>
                          <div className="text-sm text-text-secondary">{page.url}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={page.score} 
                            className={`h-2 w-16 ${
                              page.score >= 90 ? 'bg-accent-green' : 
                              page.score >= 70 ? 'bg-accent-green' : 
                              'bg-red-500'
                            }`} 
                          />
                          <span 
                            className={
                              page.score >= 90 ? 'text-accent-green' : 
                              page.score >= 70 ? 'text-accent-green' : 
                              'text-red-500'
                            }
                          >
                            {page.score}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {page.issues > 0 ? (
                          <Badge variant="outline" className="border-red-500 text-red-500">
                            {page.issues} issues
                          </Badge>
                        ) : (
                          <Badge className="bg-accent-green">No issues</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ListChecks className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DashboardCard>
          
          <DashboardCard title="Backlinks">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Anchor Text</TableHead>
                    <TableHead>Authority</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backlinks.map((backlink) => (
                    <TableRow key={backlink.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{backlink.domain}</div>
                          <div className="text-sm text-text-secondary truncate max-w-[200px]">
                            {backlink.url}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        "{backlink.anchor}"
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={backlink.authority} 
                            className="h-2 w-16" 
                          />
                          <span>{backlink.authority}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={backlink.dofollow ? 'default' : 'outline'}
                          className={backlink.dofollow ? 'bg-accent-green' : 'border-accent-orange text-accent-orange'}
                        >
                          {backlink.dofollow ? 'dofollow' : 'nofollow'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DashboardCard>
        </div>
        
        <DashboardCard title="Update Meta Tags" className="mt-6">
          <Form {...metaTagsForm}>
            <form onSubmit={metaTagsForm.handleSubmit(onMetaTagsSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={metaTagsForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page URL</FormLabel>
                      <FormControl>
                        <Input className="bg-bg-chart border-border-color" placeholder="/menu" {...field} />
                      </FormControl>
                      <FormDescription>
                        The URL path of the page to update
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={metaTagsForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input 
                          className="bg-bg-chart border-border-color" 
                          placeholder="Menu - Our Restaurant" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        50-60 characters recommended
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={metaTagsForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={3} 
                          className="bg-bg-chart border-border-color" 
                          placeholder="Browse our delicious menu featuring authentic Italian cuisine made with fresh, local ingredients."
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        150-160 characters recommended
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={metaTagsForm.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Keywords</FormLabel>
                      <FormControl>
                        <Input 
                          className="bg-bg-chart border-border-color" 
                          placeholder="italian food, pasta, pizza, local restaurant" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated keywords
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="submit" className="bg-accent-blue hover:bg-accent-blue/90">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Update Meta Tags
                </Button>
              </div>
            </form>
          </Form>
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
}