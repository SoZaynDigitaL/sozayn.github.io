import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UberDirectIntegration from './UberDirectIntegration';
import JetGoIntegration from './JetGoIntegration';
import DeliveryTrackingMap from './DeliveryTrackingMap';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Truck, Rocket, BarChart4 } from 'lucide-react';

interface DeliveryStats {
  total: number;
  completed: number;
  inProgress: number;
  cancelled: number;
  avgDeliveryTime: number;
}

interface Delivery {
  id: number;
  delivery_id: string;
  status: string;
  provider: string;
}

export default function DeliveryPartnerIntegrations() {
  const [activeDeliveryId, setActiveDeliveryId] = useState<string | undefined>(undefined);

  // Fetch delivery stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<DeliveryStats>({
    queryKey: ['/api/delivery/stats'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/delivery/stats');
      return res.json();
    },
  });

  // Fetch active deliveries for the dropdown
  const { data: deliveries, isLoading: isLoadingDeliveries } = useQuery<Delivery[]>({
    queryKey: ['/api/deliveries/active'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/deliveries?status=active');
      return res.json();
    },
  });

  // Format minutes to hours and minutes
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Truck className="h-4 w-4 mr-2" />
              Total Deliveries
            </CardTitle>
            <CardDescription>All-time deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                stats?.total || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BarChart4 className="h-4 w-4 mr-2" />
              In Progress
            </CardTitle>
            <CardDescription>Active deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                stats?.inProgress || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Rocket className="h-4 w-4 mr-2" />
              Avg. Delivery Time
            </CardTitle>
            <CardDescription>For completed deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : stats?.avgDeliveryTime ? (
                formatTime(stats.avgDeliveryTime)
              ) : (
                'N/A'
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BarChart4 className="h-4 w-4 mr-2" />
              Success Rate
            </CardTitle>
            <CardDescription>Completed vs. total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : stats && stats.total > 0 ? (
                `${Math.round((stats.completed / stats.total) * 100)}%`
              ) : (
                'N/A'
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <DeliveryTrackingMap activeDeliveryId={activeDeliveryId} />

      {!isLoadingDeliveries && deliveries && deliveries.length > 0 && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Focus delivery:</p>
          <Select
            value={activeDeliveryId}
            onValueChange={(value) => setActiveDeliveryId(value)}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select delivery to focus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All deliveries</SelectItem>
              {deliveries.map((delivery) => (
                <SelectItem key={delivery.delivery_id} value={delivery.delivery_id}>
                  #{delivery.delivery_id.slice(-6)} - {delivery.provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="mt-8">
        <Tabs defaultValue="uberdirect" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="uberdirect" className="flex items-center">
              <Truck className="h-4 w-4 mr-2 text-blue-500" />
              <span>UberDirect</span>
            </TabsTrigger>
            <TabsTrigger value="jetgo" className="flex items-center">
              <Rocket className="h-4 w-4 mr-2 text-purple-500" />
              <span>JetGo</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="uberdirect" className="space-y-4 mt-4">
            <UberDirectIntegration />
          </TabsContent>
          <TabsContent value="jetgo" className="space-y-4 mt-4">
            <JetGoIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}