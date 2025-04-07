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
  Terminal, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  XCircle,
  Link,
  BarChart,
  ArrowUpRight,
  Clock,
  Settings,
  RefreshCw,
  GitMerge,
  AlertCircle,
  HardDrive
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
import { useState } from 'react';
import { StatsCard } from '@/components/ui/stats';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Example data representing POS systems
const POS_SYSTEMS = [
  { 
    id: 1, 
    name: 'Toast POS', 
    status: 'active', 
    orders: 1256,
    lastSync: '5 min ago',
    syncStatus: 'success',
    connections: 3
  },
  { 
    id: 2, 
    name: 'Square', 
    status: 'active', 
    orders: 843,
    lastSync: '15 min ago',
    syncStatus: 'success',
    connections: 2
  },
  { 
    id: 3, 
    name: 'Clover', 
    status: 'inactive', 
    orders: 0,
    lastSync: 'Never',
    syncStatus: 'disconnected',
    connections: 0
  },
  { 
    id: 4, 
    name: 'Lightspeed', 
    status: 'warning', 
    orders: 492,
    lastSync: '2 hours ago',
    syncStatus: 'warning',
    connections: 1
  }
];

// Example data for recent sync log
const SYNC_LOGS = [
  {
    id: 1,
    timestamp: '2025-04-07 15:05:23',
    system: 'Toast POS',
    action: 'Menu Sync',
    status: 'success',
    items: 124
  },
  {
    id: 2,
    timestamp: '2025-04-07 14:45:12',
    system: 'Square',
    action: 'Order Sync',
    status: 'success',
    items: 18
  },
  {
    id: 3,
    timestamp: '2025-04-07 14:30:08',
    system: 'Lightspeed',
    action: 'Inventory Sync',
    status: 'warning',
    items: 35,
    message: '3 items failed to sync'
  },
  {
    id: 4,
    timestamp: '2025-04-07 13:15:42',
    system: 'Toast POS',
    action: 'Order Sync',
    status: 'success',
    items: 27
  }
];

export default function POSIntegration() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Query to fetch POS systems
  const { data: posSystems = POS_SYSTEMS, isLoading: posSystemsLoading } = useQuery({
    queryKey: ['/api/pos/systems'],
    enabled: false // Disabled actual API call since we're using example data
  });
  
  // Query to fetch sync logs
  const { data: syncLogs = SYNC_LOGS, isLoading: syncLogsLoading } = useQuery({
    queryKey: ['/api/pos/sync-logs'],
    enabled: false // Disabled actual API call since we're using example data
  });
  
  // Filter POS systems based on search term
  const filteredSystems = posSystems.filter(system => 
    system.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate statistics
  const activeSystems = posSystems.filter(p => p.status === 'active').length;
  const totalOrders = posSystems.reduce((sum, p) => sum + p.orders, 0);
  const systemsWithWarnings = posSystems.filter(p => p.status === 'warning' || p.syncStatus === 'warning').length;
  
  // Calculate integration health as a percentage
  const healthPercentage = Math.round(
    (posSystems.filter(p => p.status === 'active' && p.syncStatus === 'success').length / posSystems.length) * 100
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">POS Integration</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
            <Input
              type="search"
              placeholder="Search POS systems..."
              className="w-full pl-9 bg-bg-card border-border-color sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add New Integration
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Active Systems"
          value={activeSystems.toString()}
          icon={<Terminal className="h-4 w-4 text-accent-green" />}
          change={0}
          progress={75}
          progressColor="bg-accent-green"
        />
        
        <StatsCard
          title="Total Orders"
          value={totalOrders.toString()}
          icon={<BarChart className="h-4 w-4 text-accent-blue" />}
          change={12.5}
          progress={65}
          progressColor="bg-accent-blue"
        />
        
        <StatsCard
          title="Systems with Warnings"
          value={systemsWithWarnings.toString()}
          icon={<AlertCircle className="h-4 w-4 text-accent-orange" />}
          change={-25}
          progress={25}
          progressColor="bg-accent-orange"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <DashboardCard title="POS Systems">
            <div className="overflow-hidden rounded-lg border border-border-color">
              <Table>
                <TableHeader>
                  <TableRow className="bg-bg-chart">
                    <TableHead>System</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Orders Processed</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Sync Status</TableHead>
                    <TableHead>Connections</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSystems.length > 0 ? (
                    filteredSystems.map((system) => (
                      <TableRow key={system.id} className="bg-bg-card border-t border-border-color">
                        <TableCell className="font-medium">{system.name}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              system.status === 'active' 
                                ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : 
                              system.status === 'warning'
                                ? 'bg-accent-orange/10 text-accent-orange border-accent-orange/20'
                                : 'bg-destructive/10 text-destructive border-destructive/20'
                            }
                          >
                            {system.status === 'active' ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : system.status === 'warning' ? (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {system.status === 'active' ? 'Active' : 
                             system.status === 'warning' ? 'Warning' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{system.orders}</TableCell>
                        <TableCell>{system.lastSync}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              system.syncStatus === 'success' 
                                ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : 
                              system.syncStatus === 'warning'
                                ? 'bg-accent-orange/10 text-accent-orange border-accent-orange/20'
                                : 'bg-destructive/10 text-destructive border-destructive/20'
                            }
                          >
                            {system.syncStatus === 'success' ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : system.syncStatus === 'warning' ? (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {system.syncStatus === 'success' ? 'Synced' : 
                             system.syncStatus === 'warning' ? 'Warning' : 'Disconnected'}
                          </Badge>
                        </TableCell>
                        <TableCell>{system.connections}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-bg-card border-border-color">
                              <DropdownMenuItem className="cursor-pointer">
                                <Settings className="h-4 w-4 mr-2" />
                                Configure
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Sync Now
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <GitMerge className="h-4 w-4 mr-2" />
                                Manage Connections
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer text-destructive">
                                <XCircle className="h-4 w-4 mr-2" />
                                Disconnect
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
          
          <DashboardCard title="Recent Sync Activity" className="mt-6">
            <div className="overflow-hidden rounded-lg border border-border-color">
              <Table>
                <TableHeader>
                  <TableRow className="bg-bg-chart">
                    <TableHead>Timestamp</TableHead>
                    <TableHead>System</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncLogs.map((log) => (
                    <TableRow key={log.id} className="bg-bg-card border-t border-border-color">
                      <TableCell className="text-sm">{log.timestamp}</TableCell>
                      <TableCell>{log.system}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            log.status === 'success' 
                              ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : 
                            log.status === 'warning'
                              ? 'bg-accent-orange/10 text-accent-orange border-accent-orange/20'
                              : 'bg-destructive/10 text-destructive border-destructive/20'
                          }
                        >
                          {log.status === 'success' ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : log.status === 'warning' ? (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {log.status === 'success' ? 'Success' : 
                           log.status === 'warning' ? 'Warning' : 'Failed'}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.items}</TableCell>
                      <TableCell className="text-sm text-text-secondary">{log.message || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" className="gap-2">
                <Clock className="h-4 w-4" />
                View Full Sync History
              </Button>
            </div>
          </DashboardCard>
        </div>
        
        <div className="space-y-6">
          <DashboardCard title="Integration Health">
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{healthPercentage}%</div>
                <p className="text-text-secondary text-sm">System Health</p>
              </div>
              
              <Progress 
                value={healthPercentage} 
                className="h-2" 
                indicatorClassName={healthPercentage > 75 ? "bg-accent-green" : healthPercentage > 50 ? "bg-accent-blue" : "bg-accent-orange"} 
              />
              
              <div className="bg-bg-chart rounded-lg p-3 text-sm border border-border-color">
                <div className="flex justify-between mb-1">
                  <span>Active systems:</span>
                  <span className="font-medium">{activeSystems}/{posSystems.length}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Systems with warnings:</span>
                  <span className="font-medium">{systemsWithWarnings}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last full check:</span>
                  <span className="font-medium">15 min ago</span>
                </div>
              </div>
              
              <Button className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Run Health Check
              </Button>
            </div>
          </DashboardCard>
          
          <DashboardCard title="Quick Actions">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <RefreshCw className="h-4 w-4" />
                Sync All Systems
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <HardDrive className="h-4 w-4" />
                Backup Configuration
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <PlusCircle className="h-4 w-4" />
                Add New System
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                Global Settings
              </Button>
            </div>
          </DashboardCard>
          
          {systemsWithWarnings > 0 && (
            <DashboardCard title="Issues">
              <div className="space-y-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Lightspeed Sync Delay</p>
                      <p className="text-xs text-text-secondary mt-1">Last successful sync was 2 hours ago. Check API credentials.</p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Button variant="destructive" size="sm" className="text-xs">
                      Fix Now
                    </Button>
                  </div>
                </div>
              </div>
            </DashboardCard>
          )}
        </div>
      </div>
    </div>
  );
}