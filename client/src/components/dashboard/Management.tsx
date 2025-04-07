import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  FileEdit, 
  BarChart3, 
  Settings, 
  Clock,
  Tag,
  Truck,
  Utensils,
  Coffee,
  Pizza,
  Soup,
  Wine,
  ArrowRight,
  ImagePlus,
  Calendar,
  Filter,
  Search,
  Upload,
  AlertCircle,
  CheckCircle,
  X,
  PlusCircle,
  DollarSign,
  UserPlus,
  ShoppingBag,
  ChevronRight
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Types for orders, menu items, etc.
type OrderStatus = 'pending' | 'preparing' | 'ready' | 'in_transit' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  customer: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: OrderStatus;
  deliveryMethod: 'pickup' | 'delivery' | 'dine-in';
  createdAt: string;
  estimatedDelivery?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
  popular: boolean;
}

// Sample data for demonstration
const recentOrders: Order[] = [
  {
    id: 'ORD-1001',
    customer: 'John Doe',
    items: [
      { name: 'Veggie Burger', quantity: 1, price: 12.99 },
      { name: 'French Fries', quantity: 1, price: 4.99 },
      { name: 'Iced Tea', quantity: 1, price: 2.99 }
    ],
    total: 20.97,
    status: 'pending',
    deliveryMethod: 'delivery',
    createdAt: '2025-04-07T10:30:00',
    estimatedDelivery: '2025-04-07T11:15:00'
  },
  {
    id: 'ORD-1002',
    customer: 'Jane Smith',
    items: [
      { name: 'Margherita Pizza', quantity: 1, price: 14.99 },
      { name: 'Garlic Bread', quantity: 1, price: 5.99 },
      { name: 'Coca Cola', quantity: 2, price: 3.99 }
    ],
    total: 28.96,
    status: 'preparing',
    deliveryMethod: 'pickup',
    createdAt: '2025-04-07T10:15:00',
    estimatedDelivery: '2025-04-07T10:45:00'
  },
  {
    id: 'ORD-1003',
    customer: 'Michael Johnson',
    items: [
      { name: 'Chicken Salad', quantity: 1, price: 11.99 },
      { name: 'Mineral Water', quantity: 1, price: 1.99 }
    ],
    total: 13.98,
    status: 'ready',
    deliveryMethod: 'pickup',
    createdAt: '2025-04-07T09:45:00',
    estimatedDelivery: '2025-04-07T10:15:00'
  },
  {
    id: 'ORD-1004',
    customer: 'Emily Davis',
    items: [
      { name: 'Pad Thai', quantity: 1, price: 15.99 },
      { name: 'Spring Rolls', quantity: 2, price: 6.99 },
      { name: 'Thai Iced Tea', quantity: 1, price: 3.99 }
    ],
    total: 33.96,
    status: 'in_transit',
    deliveryMethod: 'delivery',
    createdAt: '2025-04-07T09:30:00',
    estimatedDelivery: '2025-04-07T10:20:00'
  },
  {
    id: 'ORD-1005',
    customer: 'Robert Wilson',
    items: [
      { name: 'Steak', quantity: 1, price: 24.99 },
      { name: 'Mashed Potatoes', quantity: 1, price: 5.99 },
      { name: 'Red Wine', quantity: 1, price: 8.99 }
    ],
    total: 39.97,
    status: 'delivered',
    deliveryMethod: 'dine-in',
    createdAt: '2025-04-07T09:00:00'
  }
];

const menuItems: MenuItem[] = [
  {
    id: 'ITEM-001',
    name: 'Veggie Burger',
    description: 'Plant-based patty with lettuce, tomato, and special sauce on a whole wheat bun.',
    price: 12.99,
    category: 'main',
    imageUrl: '/burger.jpg',
    available: true,
    popular: true
  },
  {
    id: 'ITEM-002',
    name: 'French Fries',
    description: 'Crispy golden fries seasoned with sea salt.',
    price: 4.99,
    category: 'sides',
    imageUrl: '/fries.jpg',
    available: true,
    popular: true
  },
  {
    id: 'ITEM-003',
    name: 'Iced Tea',
    description: 'Freshly brewed black tea with a slice of lemon.',
    price: 2.99,
    category: 'drinks',
    imageUrl: '/tea.jpg',
    available: true,
    popular: false
  },
  {
    id: 'ITEM-004',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, fresh mozzarella, and basil.',
    price: 14.99,
    category: 'main',
    imageUrl: '/pizza.jpg',
    available: true,
    popular: true
  },
  {
    id: 'ITEM-005',
    name: 'Garlic Bread',
    description: 'Toasted bread with garlic butter and herbs.',
    price: 5.99,
    category: 'sides',
    imageUrl: '/bread.jpg',
    available: true,
    popular: false
  },
  {
    id: 'ITEM-006',
    name: 'Coca Cola',
    description: 'Classic refreshing cola beverage.',
    price: 3.99,
    category: 'drinks',
    imageUrl: '/cola.jpg',
    available: true,
    popular: true
  },
  {
    id: 'ITEM-007',
    name: 'Chicken Salad',
    description: 'Fresh salad with grilled chicken, mixed greens, and house dressing.',
    price: 11.99,
    category: 'main',
    imageUrl: '/salad.jpg',
    available: true,
    popular: false
  },
  {
    id: 'ITEM-008',
    name: 'Mineral Water',
    description: 'Bottled still water.',
    price: 1.99,
    category: 'drinks',
    imageUrl: '/water.jpg',
    available: true,
    popular: false
  }
];

// Analytics data
const salesData = [
  { date: 'Apr 1', sales: 2100 },
  { date: 'Apr 2', sales: 2300 },
  { date: 'Apr 3', sales: 2500 },
  { date: 'Apr 4', sales: 2800 },
  { date: 'Apr 5', sales: 3200 },
  { date: 'Apr 6', sales: 3500 },
  { date: 'Apr 7', sales: 3100 }
];

const topItems = [
  { name: 'Veggie Burger', value: 28 },
  { name: 'Margherita Pizza', value: 22 },
  { name: 'French Fries', value: 19 },
  { name: 'Chicken Salad', value: 14 },
  { name: 'Coca Cola', value: 17 }
];

const orderMethodData = [
  { name: 'App Orders', value: 45 },
  { name: 'Phone Orders', value: 25 },
  { name: 'Website Orders', value: 30 }
];

const COLORS = ['#4361ee', '#8957e5', '#2ea043', '#ff9f1c', '#ffbf00'];

// Get status badge color
const getStatusBadge = (status: OrderStatus) => {
  switch(status) {
    case 'pending':
      return <Badge className="bg-yellow-500/20 text-yellow-500">Pending</Badge>;
    case 'preparing':
      return <Badge className="bg-blue-500/20 text-blue-500">Preparing</Badge>;
    case 'ready':
      return <Badge className="bg-green-500/20 text-green-500">Ready</Badge>;
    case 'in_transit':
      return <Badge className="bg-purple-500/20 text-purple-500">In Transit</Badge>;
    case 'delivered':
      return <Badge className="bg-accent-green/20 text-accent-green">Delivered</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-500/20 text-red-500">Cancelled</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
};

// Get delivery method icon
const getDeliveryIcon = (method: string) => {
  switch(method) {
    case 'delivery':
      return <Truck className="h-4 w-4" />;
    case 'pickup':
      return <ShoppingBag className="h-4 w-4" />;
    case 'dine-in':
      return <Utensils className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

// Get category icon
const getCategoryIcon = (category: string) => {
  switch(category) {
    case 'main':
      return <Pizza className="h-4 w-4" />;
    case 'sides':
      return <Soup className="h-4 w-4" />;
    case 'drinks':
      return <Coffee className="h-4 w-4" />;
    case 'desserts':
      return <Wine className="h-4 w-4" />;
    default:
      return <Utensils className="h-4 w-4" />;
  }
};

export default function Management() {
  // Order filtering state
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter orders based on status and search query
  const filteredOrders = recentOrders.filter(order => {
    // Filter by status
    if (orderFilter !== 'all' && order.status !== orderFilter) {
      return false;
    }
    
    // Filter by search query (order ID or customer name)
    if (searchQuery && !order.id.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !order.customer.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Menu filtering state
  const [menuCategory, setMenuCategory] = useState<string>('all');
  const [menuSearch, setMenuSearch] = useState<string>('');

  // Filter menu items based on category and search query
  const filteredMenu = menuItems.filter(item => {
    // Filter by category
    if (menuCategory !== 'all' && item.category !== menuCategory) {
      return false;
    }
    
    // Filter by search query (item name or description)
    if (menuSearch && !item.name.toLowerCase().includes(menuSearch.toLowerCase()) && 
        !item.description.toLowerCase().includes(menuSearch.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // New menu item form state
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: 'main',
    available: true,
    popular: false
  });

  // Handler for new item form submission
  const handleNewItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would make an API call to save the new item
    // For now, we'll just reset the form and hide it
    setNewItem({
      name: '',
      description: '',
      price: 0,
      category: 'main',
      available: true,
      popular: false
    });
    setShowNewItemForm(false);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid grid-cols-4 gap-4 bg-bg-card p-1">
          <TabsTrigger value="orders" className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue">
            <Package className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="menu" className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue">
            <FileEdit className="h-4 w-4 mr-2" />
            Menu
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-accent-blue/20 data-[state=active]:text-accent-blue">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        {/* ORDERS TAB */}
        <TabsContent value="orders" className="space-y-6">
          <DashboardCard 
            title="Order Management" 
            description="View and manage all incoming orders"
            className="shadow-lg"
          >
            <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
                  <Input 
                    placeholder="Search orders..." 
                    className="pl-9 bg-bg-dark border-border-color w-full sm:w-[250px]" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={orderFilter} onValueChange={setOrderFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-bg-dark border-border-color">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-card border-border-color">
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="bg-accent-blue hover:bg-accent-blue/90">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
            </div>
            
            <div className="rounded-lg border border-border-color overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-bg-chart">
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-bg-chart/50">
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{order.items[0].name}</span>
                          {order.items.length > 1 && (
                            <span className="text-xs text-text-secondary">
                              +{order.items.length - 1} more items
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getDeliveryIcon(order.deliveryMethod)}
                          <span className="capitalize text-sm">{order.deliveryMethod}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs">{format(new Date(order.createdAt), 'h:mm a')}</span>
                          <span className="text-xs text-text-secondary">{format(new Date(order.createdAt), 'MMM d')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DashboardCard>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DashboardCard title="Order Status">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Pending</span>
                  </div>
                  <Badge variant="outline" className="bg-bg-chart">
                    {recentOrders.filter(o => o.status === 'pending').length}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Preparing</span>
                  </div>
                  <Badge variant="outline" className="bg-bg-chart">
                    {recentOrders.filter(o => o.status === 'preparing').length}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Ready</span>
                  </div>
                  <Badge variant="outline" className="bg-bg-chart">
                    {recentOrders.filter(o => o.status === 'ready').length}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>In Transit</span>
                  </div>
                  <Badge variant="outline" className="bg-bg-chart">
                    {recentOrders.filter(o => o.status === 'in_transit').length}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent-green"></div>
                    <span>Delivered</span>
                  </div>
                  <Badge variant="outline" className="bg-bg-chart">
                    {recentOrders.filter(o => o.status === 'delivered').length}
                  </Badge>
                </div>
              </div>
            </DashboardCard>
            
            <DashboardCard title="Delivery Methods">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Delivery', value: recentOrders.filter(o => o.deliveryMethod === 'delivery').length },
                        { name: 'Pickup', value: recentOrders.filter(o => o.deliveryMethod === 'pickup').length },
                        { name: 'Dine-in', value: recentOrders.filter(o => o.deliveryMethod === 'dine-in').length }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex justify-center mt-2 space-x-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-blue"></div>
                  <span className="text-sm">Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-purple"></div>
                  <span className="text-sm">Pickup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-green"></div>
                  <span className="text-sm">Dine-in</span>
                </div>
              </div>
            </DashboardCard>
            
            <DashboardCard title="Quick Actions">
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-left">
                  <AlertCircle className="h-4 w-4 mr-2 text-accent-blue" />
                  Mark All Orders as Seen
                </Button>
                
                <Button variant="outline" className="w-full justify-start text-left">
                  <Truck className="h-4 w-4 mr-2 text-accent-green" />
                  Contact Delivery Partners
                </Button>
                
                <Button variant="outline" className="w-full justify-start text-left">
                  <CheckCircle className="h-4 w-4 mr-2 text-accent-orange" />
                  Change Order Status in Bulk
                </Button>
                
                <Button variant="outline" className="w-full justify-start text-left">
                  <Calendar className="h-4 w-4 mr-2 text-accent-purple" />
                  View Today's Schedule
                </Button>
                
                <Button variant="outline" className="w-full justify-start text-left">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>
            </DashboardCard>
          </div>
        </TabsContent>
        
        {/* MENU TAB */}
        <TabsContent value="menu" className="space-y-6">
          <DashboardCard title="Menu Management">
            <div className="text-center p-12">
              <h3 className="text-xl font-bold mb-4">Menu Management</h3>
              <p className="text-text-secondary mb-6">Edit your menu items, categories, and pricing.</p>
              <Button className="bg-accent-blue hover:bg-accent-blue/90">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New Menu Item
              </Button>
            </div>
          </DashboardCard>
        </TabsContent>
        
        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          <DashboardCard title="Restaurant Analytics">
            <div className="text-center p-12">
              <h3 className="text-xl font-bold mb-4">Analytics Dashboard</h3>
              <p className="text-text-secondary mb-6">View your business performance and sales data.</p>
              <Button className="bg-accent-blue hover:bg-accent-blue/90">
                <ArrowRight className="h-4 w-4 mr-2" />
                View Detailed Reports
              </Button>
            </div>
          </DashboardCard>
        </TabsContent>
        
        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="space-y-6">
          <DashboardCard title="Restaurant Settings">
            <div className="text-center p-12">
              <h3 className="text-xl font-bold mb-4">Restaurant Settings</h3>
              <p className="text-text-secondary mb-6">Manage your restaurant information, hours, and delivery settings.</p>
              <Button className="bg-accent-blue hover:bg-accent-blue/90">
                <Settings className="h-4 w-4 mr-2" />
                Edit Settings
              </Button>
            </div>
          </DashboardCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}