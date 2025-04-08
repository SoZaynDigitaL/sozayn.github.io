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
  Loader2,
  Trash2,
  Crown
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from '@/hooks/use-toast';

const rewardSchema = z.object({
  name: z.string().min(1, "Reward name is required"),
  points: z.string().transform((val) => parseInt(val, 10)),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["discount", "free_item", "special_offer"]),
});

type RewardFormValues = z.infer<typeof rewardSchema>;

const customerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function Loyalty() {
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch customers
  const { data: customers = [], isLoading: customersLoading } = useQuery({ 
    queryKey: ['/api/customers'],
  });
  
  // Define reward program configurations
  const loyaltyConfig = {
    pointsPerDollar: 10,
    referralPoints: 50,
    signupBonus: 100,
    minPointsRedemption: 500,
    isActive: true
  };
  
  // Define reward tiers
  const loyaltyTiers = [
    { name: 'Bronze', minPoints: 0, benefits: ['5% off orders', 'Free delivery on orders over $30'] },
    { name: 'Silver', minPoints: 1000, benefits: ['8% off orders', 'Free delivery on all orders', 'Priority customer service'] },
    { name: 'Gold', minPoints: 5000, benefits: ['12% off orders', 'Free delivery on all orders', 'Priority customer service', 'Early access to new menu items'] },
    { name: 'Platinum', minPoints: 10000, benefits: ['15% off orders', 'Free delivery on all orders', 'VIP customer service', 'Special birthday rewards', 'Exclusive events'] }
  ];
  
  // Define rewards
  const rewards = [
    { id: 1, name: 'Free Appetizer', points: 500, description: 'Redeem for any appetizer of your choice', type: 'free_item' },
    { id: 2, name: '10% Off Order', points: 750, description: '10% discount on your next order', type: 'discount' },
    { id: 3, name: 'Free Dessert', points: 600, description: 'Redeem for any dessert from our menu', type: 'free_item' },
    { id: 4, name: 'BOGO Pizza Deal', points: 1200, description: 'Buy one pizza, get one free', type: 'special_offer' }
  ];
  
  // Define the reward form
  const rewardForm = useForm<RewardFormValues>({
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      name: "",
      points: undefined,
      description: "",
      type: "discount",
    },
  });
  
  // Define the customer form
  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      email: "",
      name: "",
      phone: "",
    },
  });
  
  // Create mutation to add a new customer
  const addCustomerMutation = useMutation({
    mutationFn: (data: CustomerFormValues) => {
      return apiRequest('POST', '/api/customers', data);
    },
    onSuccess: () => {
      toast({
        title: "Customer added",
        description: "The customer has been added to your loyalty program.",
      });
      customerForm.reset();
      setIsCustomerDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add customer. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Submit handler for the reward form
  function onRewardSubmit(data: RewardFormValues) {
    console.log('Reward added:', data);
    toast({
      title: "Reward created",
      description: "The new reward has been created successfully.",
    });
    rewardForm.reset();
    setIsRewardDialogOpen(false);
  }
  
  // Submit handler for the customer form
  function onCustomerSubmit(data: CustomerFormValues) {
    addCustomerMutation.mutate(data);
  }
  
  // Get total and average points
  const totalPoints = customers.reduce((sum: number, customer: any) => sum + customer.pointsBalance, 0);
  const avgPoints = customers.length > 0 ? Math.round(totalPoints / customers.length) : 0;
  
  if (customersLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Loyalty & Rewards</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isRewardDialogOpen} onOpenChange={setIsRewardDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Reward
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-bg-card border-border-color">
              <DialogHeader>
                <DialogTitle>Create New Reward</DialogTitle>
                <DialogDescription className="text-text-secondary">
                  Create a new reward that customers can redeem with their points.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...rewardForm}>
                <form onSubmit={rewardForm.handleSubmit(onRewardSubmit)} className="space-y-6 pt-4">
                  <FormField
                    control={rewardForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reward Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Free Dessert" 
                            {...field}
                            className="bg-bg-chart border-border-color" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={rewardForm.control}
                    name="points"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points Required</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="500" 
                            {...field} 
                            className="bg-bg-chart border-border-color" 
                          />
                        </FormControl>
                        <FormDescription className="text-text-secondary">
                          Number of points customers need to redeem this reward.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={rewardForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Describe the reward" 
                            {...field} 
                            className="bg-bg-chart border-border-color" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={rewardForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reward Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-bg-chart border-border-color">
                              <SelectValue placeholder="Select reward type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-bg-card border-border-color">
                            <SelectItem value="discount">Discount</SelectItem>
                            <SelectItem value="free_item">Free Item</SelectItem>
                            <SelectItem value="special_offer">Special Offer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setIsRewardDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-accent-blue hover:bg-accent-blue/90"
                    >
                      Create Reward
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-bg-card border-border-color">
              <DialogHeader>
                <DialogTitle>Add Customer to Loyalty Program</DialogTitle>
                <DialogDescription className="text-text-secondary">
                  Add a new customer to your loyalty program.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...customerForm}>
                <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} className="space-y-6 pt-4">
                  <FormField
                    control={customerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="customer@example.com" 
                            {...field}
                            className="bg-bg-chart border-border-color" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={customerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John Doe" 
                            {...field} 
                            className="bg-bg-chart border-border-color" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={customerForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123-456-7890" 
                            {...field} 
                            className="bg-bg-chart border-border-color" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setIsCustomerDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-accent-blue hover:bg-accent-blue/90"
                      disabled={addCustomerMutation.isPending}
                    >
                      {addCustomerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Customer'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Members"
          value={customers.length.toString()}
          icon={<Users className="h-4 w-4 text-accent-blue" />}
          change={8.3}
          progress={70}
          progressColor="bg-accent-blue"
        />
        
        <StatsCard
          title="Total Points"
          value={totalPoints.toString()}
          icon={<Gem className="h-4 w-4 text-accent-purple" />}
          change={12.5}
          progress={65}
          progressColor="bg-accent-purple"
        />
        
        <StatsCard
          title="Avg. Points"
          value={avgPoints.toString()}
          icon={<Award className="h-4 w-4 text-accent-green" />}
          change={3.2}
          progress={45}
          progressColor="bg-accent-green"
        />
        
        <StatsCard
          title="Rewards Redeemed"
          value="128"
          icon={<Gift className="h-4 w-4 text-accent-orange" />}
          change={15.7}
          progress={60}
          progressColor="bg-accent-orange"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardCard 
            title="Loyalty Members" 
            headerAction={
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-text-secondary pointer-events-none" />
                <Input 
                  placeholder="Search members..." 
                  className="pl-8 bg-bg-chart border-border-color" 
                />
              </div>
            }
          >
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer: any) => {
                  // Determine the tier based on points
                  const tier = loyaltyTiers.reduce((highest, current) => {
                    return customer.pointsBalance >= current.minPoints && current.minPoints >= highest.minPoints ? current : highest;
                  }, loyaltyTiers[0]);
                  
                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.pointsBalance}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            tier.name === 'Platinum' ? 'bg-accent-purple/20 text-accent-purple' :
                            tier.name === 'Gold' ? 'bg-accent-yellow/20 text-accent-yellow' :
                            tier.name === 'Silver' ? 'bg-gray-400/20 text-gray-400' :
                            'bg-amber-700/20 text-amber-700'
                          }
                        >
                          {tier.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            Add Points
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </DashboardCard>
        </div>
        
        <div>
          <DashboardCard title="Program Settings" className="mb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Loyalty Program</p>
                  <p className="text-sm text-text-secondary">Enable/disable the entire program</p>
                </div>
                <Switch checked={loyaltyConfig.isActive} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Points Per Dollar</label>
                <Input 
                  type="number" 
                  value={loyaltyConfig.pointsPerDollar}
                  className="bg-bg-chart border-border-color" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Referral Bonus</label>
                <Input 
                  type="number" 
                  value={loyaltyConfig.referralPoints}
                  className="bg-bg-chart border-border-color" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Signup Bonus</label>
                <Input 
                  type="number" 
                  value={loyaltyConfig.signupBonus}
                  className="bg-bg-chart border-border-color" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Points for Redemption</label>
                <Input 
                  type="number" 
                  value={loyaltyConfig.minPointsRedemption}
                  className="bg-bg-chart border-border-color" 
                />
              </div>
              
              <Button className="w-full bg-accent-blue hover:bg-accent-blue/90">
                Save Settings
              </Button>
            </div>
          </DashboardCard>
          
          <DashboardCard title="Loyalty Tiers">
            <div className="space-y-3">
              {loyaltyTiers.map((tier, index) => (
                <div 
                  key={tier.name}
                  className="p-3 border border-border-color rounded-lg bg-bg-chart"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className={
                        tier.name === 'Platinum' ? 'text-accent-purple bg-accent-purple/20' :
                        tier.name === 'Gold' ? 'text-accent-yellow bg-accent-yellow/20' :
                        tier.name === 'Silver' ? 'text-gray-400 bg-gray-400/20' :
                        'text-amber-700 bg-amber-700/20'
                      }
                      className="p-1.5 rounded-full"
                    >
                      <Crown className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium">{tier.name}</h3>
                    <div className="ml-auto text-sm text-text-secondary">
                      {tier.minPoints}+ points
                    </div>
                  </div>
                  
                  <div className="text-sm text-text-secondary">
                    <ul className="space-y-1">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
      
      <DashboardCard title="Available Rewards">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {rewards.map((reward) => (
            <Card key={reward.id} className="bg-bg-chart border-border-color">
              <CardHeader className="pb-2">
                <Badge
                  className={
                    reward.type === 'discount' ? 'bg-accent-green/20 text-accent-green self-start' :
                    reward.type === 'free_item' ? 'bg-accent-blue/20 text-accent-blue self-start' :
                    'bg-accent-orange/20 text-accent-orange self-start'
                  }
                >
                  {reward.type === 'discount' ? 'Discount' : 
                   reward.type === 'free_item' ? 'Free Item' : 'Special Offer'}
                </Badge>
                <CardTitle className="text-lg">{reward.name}</CardTitle>
                <CardDescription className="text-text-secondary">
                  {reward.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between pt-2">
                <div className="text-sm font-medium text-accent-purple flex items-center">
                  <Gem className="h-4 w-4 mr-1" />
                  {reward.points} Points
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </CardFooter>
            </Card>
          ))}
          
          <Card className="bg-bg-chart/50 border-border-color border-dashed flex items-center justify-center cursor-pointer hover:bg-bg-chart transition-colors p-6"
            onClick={() => setIsRewardDialogOpen(true)}
          >
            <div className="text-center">
              <PlusCircle className="h-8 w-8 mx-auto mb-2 text-text-secondary" />
              <p className="text-text-secondary">Add New Reward</p>
            </div>
          </Card>
        </div>
      </DashboardCard>
    </div>
  );
}
