import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  LayoutGrid, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  XCircle,
  Link as LinkIcon,
  Repeat,
  Clock,
  Settings,
  ArrowRightLeft,
  AlertTriangle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Example data representing POS systems
const POS_SYSTEMS = [
  { 
    id: 1, 
    name: 'Square', 
    status: 'active', 
    lastSync: '5 min ago',
    orderCount: 234,
    syncSuccess: '98%',
    location: 'Primary Restaurant'
  },
  { 
    id: 2, 
    name: 'Toast', 
    status: 'active', 
    lastSync: '15 min ago',
    orderCount: 156,
    syncSuccess: '95%',
    location: 'Downtown Location'
  },
  { 
    id: 3, 
    name: 'Clover', 
    status: 'inactive', 
    lastSync: 'Never',
    orderCount: 0,
    syncSuccess: '0%',
    location: 'N/A'
  },
  { 
    id: 4, 
    name: 'Lightspeed', 
    status: 'active', 
    lastSync: '10 min ago',
    orderCount: 189,
    syncSuccess: '99%',
    location: 'Westside Branch'
  }
];

// Example sync logs
const SYNC_LOGS = [
  {
    id: 1,
    timestamp: '2025-04-07 14:22:34',
    system: 'Square',
    status: 'success',
    details: '126 orders processed',
    duration: '45s'
  },
  {
    id: 2,
    timestamp: '2025-04-07 14:10:12',
    system: 'Toast',
    status: 'success',
    details: '84 orders processed',
    duration: '38s'
  },
  {
    id: 3,
    timestamp: '2025-04-07 13:55:21',
    system: 'Lightspeed',
    status: 'warning',
    details: '95 orders processed, 2 with warnings',
    duration: '52s'
  },
  {
    id: 4,
    timestamp: '2025-04-07 13:40:05',
    system: 'Square',
    status: 'error',
    details: 'Connection timeout',
    duration: '120s'
  },
  {
    id: 5,
    timestamp: '2025-04-07 13:25:48',
    system: 'Toast',
    status: 'success',
    details: '72 orders processed',
    duration: '41s'
  }
];

type POSSystem = {
  id: number;
  name: string;
  status: string;
  lastSync: string;
  orderCount: number;
  syncSuccess: string;
  location: string;
};

type SyncLog = {
  id: number;
  timestamp: string;
  system: string;
  status: string;
  details: string;
  duration: string;
};

export default function POSIntegration() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('systems');
  
  // Query to fetch POS systems
  const { data: posSystems = POS_SYSTEMS } = useQuery({
    queryKey: ['/api/pos/systems'],
    enabled: false // Disabled actual API call since we're using example data
  });
  
  // Filter systems based on search term
  const filteredSystems = posSystems.filter((system: POSSystem) => 
    system.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    system.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate statistics
  const activeSystems = posSystems.filter((p: POSSystem) => p.status === 'active').length;
  const totalOrders = posSystems.reduce((sum: number, p: POSSystem) => sum + p.orderCount, 0);
  const avgSyncSuccess = posSystems.filter((p: POSSystem) => p.status === 'active').reduce((sum: number, p: POSSystem) => {
    return sum + parseInt(p.syncSuccess.replace('%', ''));
  }, 0) / activeSystems;
  
  // Query to fetch sync logs
  const { data: syncLogs = SYNC_LOGS } = useQuery({
    queryKey: ['/api/pos/sync-logs'],
    enabled: false // Disabled actual API call since we're using example data
  });
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">POS Integration</h1>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
              <Input
                type="search"
                placeholder={`Search ${activeTab === 'systems' ? 'POS systems' : 'sync logs'}...`}
                className="w-full pl-9 bg-bg-card border-border-color sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add POS System
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Active Systems"
            value={activeSystems.toString()}
            icon={<LayoutGrid className="h-4 w-4 text-accent-green" />}
            change={25}
            progress={80}
            progressColor="bg-accent-green"
          />
          
          <StatsCard
            title="Orders Processed"
            value={totalOrders.toString()}
            icon={<Repeat className="h-4 w-4 text-accent-blue" />}
            change={18.5}
            progress={65}
            progressColor="bg-accent-blue"
          />
          
          <StatsCard
            title="Sync Success Rate"
            value={`${avgSyncSuccess.toFixed(1)}%`}
            icon={<ArrowRightLeft className="h-4 w-4 text-accent-purple" />}
            change={3.2}
            progress={avgSyncSuccess}
            progressColor="bg-accent-purple"
          />
        </div>
        
        <Tabs defaultValue="systems" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="systems">POS Systems</TabsTrigger>
            <TabsTrigger value="logs">Sync Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="systems">
            <DashboardCard title="Point of Sale Systems">
              <div className="overflow-hidden rounded-lg border border-border-color">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-bg-chart">
                      <TableHead>System</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Sync Success</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSystems.length > 0 ? (
                      filteredSystems.map((system: POSSystem) => (
                        <TableRow key={system.id} className="bg-bg-card border-t border-border-color">
                          <TableCell className="font-medium">{system.name}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={
                                system.status === 'active' 
                                  ? 'bg-accent-green/10 text-accent-green border-accent-green/20' 
                                  : 'bg-destructive/10 text-destructive border-destructive/20'
                              }
                            >
                              {system.status === 'active' ? (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {system.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{system.location}</TableCell>
                          <TableCell>{system.orderCount}</TableCell>
                          <TableCell>{system.syncSuccess}</TableCell>
                          <TableCell>{system.lastSync}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-text-secondary">
                          No POS systems found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </DashboardCard>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <DashboardCard title="POS Integrations">
                <div className="grid gap-4">
                  {['Square', 'Toast', 'Clover', 'Lightspeed'].map((integration, index) => (
                    <Card key={index} className="bg-bg-card border-border-color">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-md">{integration}</CardTitle>
                          <Badge className={index !== 2 ? 'bg-accent-green' : 'bg-accent-blue'}>
                            {index !== 2 ? 'Connected' : 'Available'}
                          </Badge>
                        </div>
                        <CardDescription>
                          {index !== 2 
                            ? 'Integration is active and working properly.' 
                            : 'Click to set up this integration for your store.'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex justify-end">
                        <Button variant="outline" size="sm" className="gap-2">
                          {index !== 2 ? (
                            <>
                              <Settings className="h-4 w-4" />
                              Configure
                            </>
                          ) : (
                            <>
                              <LinkIcon className="h-4 w-4" />
                              Connect
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DashboardCard>
              
              <DashboardCard title="Sync Settings">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Auto-Sync Schedule</h3>
                    <Card className="bg-bg-card border-border-color p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-accent-purple" />
                        <div>
                          <p className="font-medium">Every 5 minutes</p>
                          <p className="text-sm text-text-secondary">Orders, inventory & menus</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Card>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Manual Sync</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="w-full">Sync Menus</Button>
                      <Button variant="outline" className="w-full">Sync Orders</Button>
                    </div>
                    <Button className="w-full">Sync All Systems Now</Button>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </TabsContent>
          
          <TabsContent value="logs">
            <DashboardCard title="Synchronization Logs">
              <div className="overflow-hidden rounded-lg border border-border-color">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-bg-chart">
                      <TableHead>Timestamp</TableHead>
                      <TableHead>System</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncLogs.map((log: SyncLog) => (
                      <TableRow key={log.id} className="bg-bg-card border-t border-border-color">
                        <TableCell className="font-medium">{log.timestamp}</TableCell>
                        <TableCell>{log.system}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              log.status === 'success' 
                                ? 'bg-accent-green/10 text-accent-green border-accent-green/20' 
                                : log.status === 'warning'
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-destructive/10 text-destructive border-destructive/20'
                            }
                          >
                            {log.status === 'success' ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : log.status === 'warning' ? (
                              <AlertTriangle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.details}</TableCell>
                        <TableCell>{log.duration}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DashboardCard>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card className="bg-bg-card border-border-color">
                <CardHeader>
                  <CardTitle className="text-lg">Sync Health</CardTitle>
                  <CardDescription>Overall system status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent-green/20 text-accent-green">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Square</p>
                        <p className="text-sm text-text-secondary">98% sync success rate</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Details</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent-green/20 text-accent-green">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Toast</p>
                        <p className="text-sm text-text-secondary">95% sync success rate</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Details</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-500/20 text-amber-500">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Lightspeed</p>
                        <p className="text-sm text-text-secondary">91% sync success rate</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Details</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-bg-card border-border-color">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Common sync tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <ArrowRightLeft className="h-4 w-4" />
                    Force Sync All Systems
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Clock className="h-4 w-4" />
                    Modify Sync Schedule
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Settings className="h-4 w-4" />
                    Configure Automatic Retry
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Connect New POS System
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}