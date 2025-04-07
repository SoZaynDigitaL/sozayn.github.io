import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Clock,
  FileText,
  AlertCircle,
  SendHorizontal,
  UserCog,
  CreditCard 
} from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCustomersData } from '@/lib/dashboardData';

// Define Customer type based on the data structure from dashboardData
type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold';
  createdAt: string;
  lastOrder?: string;
  notes?: string;
  address?: string;
};

// Form schemas
const clientFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(7, { message: "Please enter a valid phone number." }),
  notes: z.string().optional(),
  address: z.string().optional(),
  loyaltyTier: z.enum(['bronze', 'silver', 'gold']).optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function ClientsPage() {
  const { toast } = useToast();
  const [view, setView] = useState<'all' | 'active' | 'inactive'>('all');
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
  
  // Client form
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      notes: '',
      address: '',
      loyaltyTier: 'bronze',
    },
  });

  // Get customers data
  const { data: clients = [], isLoading: clientsLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  // Function to open client form dialog for adding a new client
  const openNewClientDialog = () => {
    form.reset({
      name: '',
      email: '',
      phone: '',
      notes: '',
      address: '',
      loyaltyTier: 'bronze',
    });
    setSelectedClient(null);
    setClientDialogOpen(true);
  };

  // Function to open client form dialog for editing an existing client
  const openEditClientDialog = (client: Customer) => {
    form.reset({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      notes: client.notes || '',
      address: client.address || '',
      loyaltyTier: client.loyaltyTier || 'bronze',
    });
    setSelectedClient(client);
    setClientDialogOpen(true);
  };

  // Mutation for adding/editing a client
  const clientMutation = useMutation({
    mutationFn: (formData: ClientFormValues) => {
      // In a real app, this would make an API call
      // For now, we'll just simulate success
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
    },
    onSuccess: () => {
      setClientDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      
      toast({
        title: selectedClient ? "Client updated" : "Client added",
        description: selectedClient 
          ? "The client information has been updated." 
          : "The new client has been added to your system.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error processing your request.",
        variant: "destructive",
      });
    }
  });

  // Function to handle form submission
  const onSubmit = (data: ClientFormValues) => {
    clientMutation.mutate(data);
  };

  // Function to format currency
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // Calculate stats
  const totalClients = clients.length;
  const activeClients = clients.filter((client: Customer) => client.totalOrders > 0).length;
  const returningClients = clients.filter((client: Customer) => client.totalOrders > 1).length;
  const totalSpent = clients.reduce((acc: number, client: Customer) => acc + client.totalSpent, 0);

  // Get formatted data for display
  const getDisplayClients = (): Customer[] => {
    // Always use the real data from the API
    return clients;
  };

  const displayClients = getDisplayClients();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header with action button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Client Management</h1>
            <p className="text-text-secondary">
              View and manage your client profiles, subscriptions, and activity
            </p>
          </div>
          
          <Button 
            onClick={openNewClientDialog}
            className="bg-accent-blue hover:bg-accent-blue/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Client
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Total Clients</p>
                  <h3 className="text-2xl font-bold mt-1">{totalClients}</h3>
                </div>
                <div className="bg-accent-blue/20 p-3 rounded-full">
                  <User className="h-5 w-5 text-accent-blue" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Active Clients</p>
                  <h3 className="text-2xl font-bold mt-1">{activeClients}</h3>
                </div>
                <div className="bg-accent-green/20 p-3 rounded-full">
                  <UserCog className="h-5 w-5 text-accent-green" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Returning Clients</p>
                  <h3 className="text-2xl font-bold mt-1">{returningClients}</h3>
                </div>
                <div className="bg-accent-purple/20 p-3 rounded-full">
                  <Clock className="h-5 w-5 text-accent-purple" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Total Revenue</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalSpent)}</h3>
                </div>
                <div className="bg-accent-orange/20 p-3 rounded-full">
                  <CreditCard className="h-5 w-5 text-accent-orange" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients table */}
        <DashboardCard 
          title="Client List" 
          description="Manage all your clients and their information"
          headerAction={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <Input 
                  placeholder="Search clients..." 
                  className="pl-8 bg-bg-chart border-border-color w-[200px]" 
                />
              </div>
              <Tabs defaultValue="all" onValueChange={(v) => setView(v as any)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          }
        >
          {clientsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
            </div>
          ) : displayClients.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <User className="h-12 w-12 mx-auto text-text-secondary opacity-50" />
              <p className="text-text-secondary">No clients found</p>
              <Button 
                onClick={openNewClientDialog} 
                variant="outline"
              >
                Add Your First Client
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Loyalty</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayClients.map((client: Customer) => (
                  <TableRow key={client.id} className="cursor-pointer hover:bg-bg-card-hover"
                    onClick={() => openEditClientDialog(client)}
                  >
                    <TableCell className="font-medium">
                      {client.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs flex items-center">
                          <Mail className="h-3 w-3 mr-1 text-text-secondary" /> 
                          {client.email}
                        </span>
                        {client.phone && (
                          <span className="text-xs flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1 text-text-secondary" /> 
                            {client.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.totalOrders > 0 ? "default" : "secondary"}>
                        {client.totalOrders > 0 ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{client.totalOrders}</TableCell>
                    <TableCell>{formatCurrency(client.totalSpent)}</TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          client.loyaltyTier === "gold" 
                            ? "bg-amber-700/20 text-amber-700 border-amber-700/20"
                            : client.loyaltyTier === "silver"
                              ? "bg-slate-400/20 text-slate-400 border-slate-400/20"
                              : "bg-amber-600/20 text-amber-600 border-amber-600/20"
                        }
                      >
                        {client.loyaltyTier.charAt(0).toUpperCase() + client.loyaltyTier.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {client.lastOrder ? (
                        <span className="flex items-center text-xs">
                          <Clock className="h-3 w-3 mr-1 text-text-secondary" />
                          {format(new Date(client.lastOrder), 'MMM d, h:mm a')}
                        </span>
                      ) : (
                        <span className="text-text-secondary text-xs">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            openEditClientDialog(client);
                          }}>
                            <User className="h-4 w-4 mr-2" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Orders
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <SendHorizontal className="h-4 w-4 mr-2" />
                            Send Promo
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Mark as Inactive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DashboardCard>
      </div>

      {/* Client form dialog */}
      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedClient ? "Edit Client" : "Add New Client"}</DialogTitle>
            <DialogDescription>
              {selectedClient 
                ? "Update the client's information in your system." 
                : "Enter the client's details to add them to your system."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John Doe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="john@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1 (555) 123-4567" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123 Main St, City, State, Zip" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Add any notes about this client"
                          className="h-20"
                        />
                      </FormControl>
                      <FormDescription>
                        Optional additional information about this client
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setClientDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={clientMutation.isPending}
                >
                  {clientMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {selectedClient ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    selectedClient ? "Update Client" : "Add Client"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}