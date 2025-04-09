/**
 * Application constants for SoZayn
 */

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  INTEGRATIONS: {
    LIST: '/api/integrations',
    CREATE: '/api/integrations',
    UPDATE: (id: number) => `/api/integrations/${id}`,
    DELETE: (id: number) => `/api/integrations/${id}`,
  },
  ORDERS: {
    LIST: '/api/orders',
    RECENT: '/api/orders/recent',
    CREATE: '/api/orders',
    STATUS: (id: number) => `/api/orders/${id}/status`,
  },
  CUSTOMERS: {
    LIST: '/api/customers',
    CREATE: '/api/customers',
    POINTS: (id: number) => `/api/customers/${id}/points`,
  },
  DEMO: {
    GENERATE: '/api/demo/generate',
  },
};

// Business types
export const BUSINESS_TYPES = [
  { label: 'Restaurant', value: 'restaurant' },
  { label: 'Grocery Store', value: 'grocery' },
  { label: 'Café', value: 'cafe' },
  { label: 'Bakery', value: 'bakery' },
  { label: 'Food Truck', value: 'foodtruck' },
  { label: 'Other', value: 'other' },
];

// Order status types
export const ORDER_STATUSES = [
  { label: 'Received', value: 'received' },
  { label: 'Prepared', value: 'prepared' },
  { label: 'Picked Up', value: 'picked_up' },
  { label: 'In Transit', value: 'in_transit' },
  { label: 'Delivered', value: 'delivered' },
];

// Delivery partners
export const DELIVERY_PARTNERS = [
  { label: 'DoorDash', value: 'doordash', icon: 'DD', color: 'text-accent-orange' },
  { label: 'UberDirect', value: 'uberdirect', icon: 'UE', color: 'text-accent-blue' },
  { label: 'Grubhub', value: 'grubhub', icon: 'GH', color: 'text-accent-green' },
  { label: 'Postmates', value: 'postmates', icon: 'PM', color: 'text-text-primary' },
  { label: 'SkipDishes', value: 'skipdishes', icon: 'SD', color: 'text-accent-yellow' },
  { label: 'Seamless', value: 'seamless', icon: 'SM', color: 'text-accent-purple' },
];

// POS systems
export const POS_SYSTEMS = [
  { name: 'Toast', icon: 'TS', color: 'text-accent-blue' },
  { name: 'Square', icon: 'SQ', color: 'text-accent-green' },
  { name: 'Clover', icon: 'CL', color: 'text-accent-orange' },
  { name: 'Lightspeed', icon: 'LS', color: 'text-text-primary' },
  { name: 'TouchBistro', icon: 'TB', color: 'text-accent-purple' },
  { name: 'Revel', icon: 'RV', color: 'text-accent-yellow' },
];

// Loyalty tiers
export const LOYALTY_TIERS = [
  { 
    name: 'Bronze', 
    minPoints: 0, 
    color: 'text-amber-700 bg-amber-700/20',
    benefits: ['5% off orders', 'Free delivery on orders over $30']
  },
  { 
    name: 'Silver', 
    minPoints: 1000,

    color: 'text-gray-400 bg-gray-400/20',
    benefits: ['8% off orders', 'Free delivery on all orders', 'Priority customer service']
  },
  { 
    name: 'Gold', 
    minPoints: 5000, 
    color: 'text-accent-yellow bg-accent-yellow/20',
    benefits: ['12% off orders', 'Free delivery on all orders', 'Priority customer service', 'Early access to new menu items']
  },
  { 
    name: 'Platinum', 
    minPoints: 10000, 
    color: 'text-accent-purple bg-accent-purple/20',
    benefits: ['15% off orders', 'Free delivery on all orders', 'VIP customer service', 'Special birthday rewards', 'Exclusive events']
  },
];

// App theme colors
export const THEME_COLORS = {
  BG_DARK: 'var(--bg-dark)',
  BG_CARD: 'var(--bg-card)',
  BG_CARD_HOVER: 'var(--bg-card-hover)',
  BG_CHART: 'var(--bg-chart)',
  TEXT_PRIMARY: 'var(--text-primary)',
  TEXT_SECONDARY: 'var(--text-secondary)',
  ACCENT_BLUE: 'var(--accent-blue)',
  ACCENT_PURPLE: 'var(--accent-purple)',
  ACCENT_GREEN: 'var(--accent-green)',
  ACCENT_ORANGE: 'var(--accent-orange)',
  ACCENT_YELLOW: 'var(--accent-yellow)',
  BORDER_COLOR: 'var(--border-color)',
};
