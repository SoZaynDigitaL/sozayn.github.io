import { apiRequest, queryClient } from '@/lib/queryClient';

export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'received' | 'prepared' | 'picked_up' | 'in_transit' | 'delivered';
  source: string;
  deliveryMethod: 'pickup' | 'delivery' | 'dine-in';
  createdAt: string;
  estimatedDelivery?: string;
}

export interface Customer {
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
}

export interface Integration {
  id: string;
  provider: string;
  type: 'delivery' | 'pos' | 'payment' | 'loyalty';
  isActive: boolean;
  lastSynced: string;
  credentials?: Record<string, string>;
  settings?: Record<string, any>;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
  popular: boolean;
}

// Function to generate an order for today
function generateOrder(id: number): Order {
  const statuses: Order['status'][] = ['received', 'prepared', 'picked_up', 'in_transit', 'delivered'];
  const sources = ['Direct', 'UberEats', 'DoorDash', 'Grubhub', 'Website'];
  const deliveryMethods: Order['deliveryMethod'][] = ['pickup', 'delivery', 'dine-in'];
  
  const randomItems = [
    { name: 'Margherita Pizza', quantity: 1, price: 1299 },
    { name: 'Classic Burger', quantity: 1, price: 1499 },
    { name: 'Caesar Salad', quantity: 1, price: 999 },
  ];
  
  const now = new Date();
  const minutesAgo = Math.floor(Math.random() * 180);
  const orderTime = new Date(now.getTime() - (minutesAgo * 60 * 1000));
  
  return {
    id: `order-${id}`,
    orderNumber: `ORD-${1000 + id}`,
    customer: ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Brown'][Math.floor(Math.random() * 4)],
    items: randomItems,
    totalAmount: randomItems.reduce((total, item) => total + (item.price * item.quantity), 0),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    deliveryMethod: deliveryMethods[Math.floor(Math.random() * deliveryMethods.length)],
    createdAt: orderTime.toISOString(),
    estimatedDelivery: new Date(orderTime.getTime() + (30 * 60 * 1000)).toISOString(),
  };
}

// Function to generate a customer
function generateCustomer(id: number): Customer {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90);
  const registrationDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  
  const totalOrders = Math.floor(Math.random() * 20) + 1;
  const totalSpent = totalOrders * (Math.floor(Math.random() * 3000) + 1000);
  const loyaltyPoints = Math.floor(totalSpent / 100);
  
  let loyaltyTier: Customer['loyaltyTier'] = 'bronze';
  if (loyaltyPoints > 100) loyaltyTier = 'silver';
  if (loyaltyPoints > 300) loyaltyTier = 'gold';
  
  return {
    id: `customer-${id}`,
    name: ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Brown', 'Emily Davis', 'Michael Wilson'][Math.floor(Math.random() * 6)],
    email: `customer${id}@example.com`,
    phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    totalOrders,
    totalSpent,
    loyaltyPoints,
    loyaltyTier,
    createdAt: registrationDate.toISOString(),
    lastOrder: new Date(now.getTime() - (Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)).toISOString(),
  };
}

// Function to generate an integration
function generateIntegration(id: number): Integration {
  const providers = [
    { name: 'DoorDash', type: 'delivery' },
    { name: 'UberEats', type: 'delivery' },
    { name: 'Grubhub', type: 'delivery' },
    { name: 'Toast', type: 'pos' },
    { name: 'Square', type: 'pos' },
    { name: 'Clover', type: 'pos' },
    { name: 'Stripe', type: 'payment' },
    { name: 'PayPal', type: 'payment' },
    { name: 'LevelUp', type: 'loyalty' },
  ];
  
  const provider = providers[id % providers.length];
  const now = new Date();
  const hoursAgo = Math.floor(Math.random() * 72);
  
  return {
    id: `integration-${id}`,
    provider: provider.name,
    type: provider.type as 'delivery' | 'pos' | 'payment' | 'loyalty',
    isActive: Math.random() > 0.3, // 70% are active
    lastSynced: new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000)).toISOString(),
  };
}

// Function to generate menu items
function generateMenuItem(id: number): MenuItem {
  const categories = ['Appetizers', 'Main Courses', 'Desserts', 'Drinks', 'Sides'];
  const foodNames = [
    'Margherita Pizza', 'Pepperoni Pizza', 'Caesar Salad', 'Greek Salad',
    'Classic Burger', 'Cheeseburger', 'Chicken Wings', 'Garlic Bread',
    'Chocolate Cake', 'Ice Cream', 'Tiramisu', 'Cheesecake',
    'Soda', 'Lemonade', 'Iced Tea', 'Coffee',
    'French Fries', 'Onion Rings', 'Mashed Potatoes', 'Coleslaw'
  ];
  
  const category = categories[Math.floor(id / 4) % categories.length];
  const name = foodNames[id % foodNames.length];
  
  return {
    id: `item-${id}`,
    name,
    description: `Delicious ${name.toLowerCase()} made with the finest ingredients.`,
    price: (Math.floor(Math.random() * 20) + 5) * 100, // Price in cents (between $5 and $25)
    category,
    available: Math.random() > 0.1, // 90% are available
    popular: Math.random() > 0.7, // 30% are popular
  };
}

// Generate sample data for the dashboard
export function generateDashboardData() {
  // Generate 10 orders
  const orders = Array.from({ length: 10 }, (_, i) => generateOrder(i + 1));
  
  // Generate 20 customers
  const customers = Array.from({ length: 20 }, (_, i) => generateCustomer(i + 1));
  
  // Generate 6 integrations
  const integrations = Array.from({ length: 6 }, (_, i) => generateIntegration(i + 1));
  
  // Generate 20 menu items
  const menuItems = Array.from({ length: 20 }, (_, i) => generateMenuItem(i + 1));
  
  // Return the generated data
  return {
    orders,
    customers,
    integrations,
    menuItems
  };
}

// Function to fetch dashboard data (in a real app, this would fetch from the API)
export async function fetchDashboardData() {
  try {
    // In a real app, these would be separate API calls
    const ordersResponse = await apiRequest('GET', '/api/orders');
    let orders = await ordersResponse.json();
    
    // If no orders, generate demo data
    if (!orders || orders.length === 0) {
      const data = generateDashboardData();
      
      // Save the generated data to local storage to simulate persistence
      localStorage.setItem('sozayn_demo_orders', JSON.stringify(data.orders));
      localStorage.setItem('sozayn_demo_customers', JSON.stringify(data.customers));
      localStorage.setItem('sozayn_demo_integrations', JSON.stringify(data.integrations));
      localStorage.setItem('sozayn_demo_menuItems', JSON.stringify(data.menuItems));
      
      orders = data.orders;
      
      // Update the cache
      queryClient.setQueryData(['/api/orders'], data.orders);
      queryClient.setQueryData(['/api/orders/recent'], data.orders.slice(0, 5));
      queryClient.setQueryData(['/api/customers'], data.customers);
      queryClient.setQueryData(['/api/integrations'], data.integrations);
      queryClient.setQueryData(['/api/menu'], data.menuItems);
    }
    
    return orders;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

// Function to fetch orders (or use cached/demo data)
export function getOrdersData(): Order[] {
  const cachedOrders = queryClient.getQueryData(['/api/orders']);
  if (cachedOrders) return cachedOrders as Order[];
  
  const storedOrders = localStorage.getItem('sozayn_demo_orders');
  if (storedOrders) return JSON.parse(storedOrders);
  
  return generateDashboardData().orders;
}

// Function to fetch customers (or use cached/demo data)
export function getCustomersData(): Customer[] {
  const cachedCustomers = queryClient.getQueryData(['/api/customers']);
  if (cachedCustomers) return cachedCustomers as Customer[];
  
  const storedCustomers = localStorage.getItem('sozayn_demo_customers');
  if (storedCustomers) return JSON.parse(storedCustomers);
  
  return generateDashboardData().customers;
}

// Function to fetch integrations (or use cached/demo data)
export function getIntegrationsData(): Integration[] {
  const cachedIntegrations = queryClient.getQueryData(['/api/integrations']);
  if (cachedIntegrations) return cachedIntegrations as Integration[];
  
  const storedIntegrations = localStorage.getItem('sozayn_demo_integrations');
  if (storedIntegrations) return JSON.parse(storedIntegrations);
  
  return generateDashboardData().integrations;
}

// Function to fetch menu items (or use cached/demo data)
export function getMenuItemsData(): MenuItem[] {
  const cachedMenuItems = queryClient.getQueryData(['/api/menu']);
  if (cachedMenuItems) return cachedMenuItems as MenuItem[];
  
  const storedMenuItems = localStorage.getItem('sozayn_demo_menuItems');
  if (storedMenuItems) return JSON.parse(storedMenuItems);
  
  return generateDashboardData().menuItems;
}

// Analytics functions
export function getOrderAnalytics() {
  const orders = getOrdersData();
  
  // Weekly order counts for the past 4 weeks
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const fourWeeksAgo = new Date(now.getTime() - (28 * oneDay));
  
  const weeklyLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const weeklyValues = [320, 410, 385, 450]; // Simulated values
  
  // Status breakdown
  const statusCounts = {
    received: orders.filter(o => o.status === 'received').length,
    prepared: orders.filter(o => o.status === 'prepared').length,
    picked_up: orders.filter(o => o.status === 'picked_up').length,
    in_transit: orders.filter(o => o.status === 'in_transit').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };
  
  return {
    weeklyData: {
      labels: weeklyLabels,
      values: weeklyValues
    },
    statusData: {
      labels: Object.keys(statusCounts).map(s => s.replace('_', ' ')),
      values: Object.values(statusCounts)
    }
  };
}

export function getRevenueAnalytics() {
  // Monthly revenue for the past 6 months
  const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthlyValues = [1200, 1900, 2300, 2800, 2400, 2800]; // Simulated values in dollars
  
  return {
    monthlyData: {
      labels: monthlyLabels,
      values: monthlyValues
    }
  };
}

export function getCustomerAnalytics() {
  const customers = getCustomersData();
  
  // Customer breakdown by loyalty tier
  const tierCounts = {
    bronze: customers.filter(c => c.loyaltyTier === 'bronze').length,
    silver: customers.filter(c => c.loyaltyTier === 'silver').length,
    gold: customers.filter(c => c.loyaltyTier === 'gold').length,
  };
  
  // New vs returning customers (simplified)
  const newVsReturning = {
    new: customers.filter(c => c.totalOrders <= 1).length,
    returning: customers.filter(c => c.totalOrders > 1).length,
  };
  
  // Calculate percentages for the semi-donut chart
  const totalCustomers = customers.length;
  const newPercentage = Math.round((newVsReturning.new / totalCustomers) * 100);
  const returningPercentage = Math.round((newVsReturning.returning / totalCustomers) * 100);
  
  return {
    tierData: {
      labels: Object.keys(tierCounts).map(t => t.charAt(0).toUpperCase() + t.slice(1)),
      values: Object.values(tierCounts)
    },
    customerTypeData: {
      labels: ['New', 'Returning'],
      values: [newVsReturning.new, newVsReturning.returning]
    },
    // New formatted data for the semi-donut chart
    segmentData: {
      labels: ['New', 'Returning'],
      values: [newPercentage, returningPercentage]
    }
  };
}