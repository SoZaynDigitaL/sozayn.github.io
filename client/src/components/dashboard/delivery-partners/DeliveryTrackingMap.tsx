import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import DeliveryMapView from '@/components/map/DeliveryMapView';
import '@/components/map/map.css';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Types for deliveries
interface DeliveryCoordinates {
  lat: number;
  lng: number;
}

interface DeliveryLocation {
  id: string;
  lat: number;
  lng: number;
  type: 'restaurant' | 'customer' | 'vehicle';
  name: string;
  vehicleType?: 'car' | 'truck' | 'scooter' | 'bicycle' | 'drone';
  status?: string;
  eta?: string;
  bearing?: number;
}

interface Delivery {
  id: string;
  provider: string;
  status: string;
  trackingUrl: string;
  createdAt: string;
  pickupEta?: string;
  dropoffEta?: string;
  pickupLocation?: DeliveryCoordinates;
  dropoffLocation?: DeliveryCoordinates;
  currentLocation?: DeliveryCoordinates;
  driverName?: string;
  vehicleType?: string;
}

interface DeliveryTrackingMapProps {
  deliveryId?: string;
  onRefresh?: () => void;
}

const DeliveryTrackingMap: React.FC<DeliveryTrackingMapProps> = ({ deliveryId, onRefresh }) => {
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [centerLocation, setCenterLocation] = useState<DeliveryCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch delivery details if deliveryId is provided
  const { data: delivery, isLoading, refetch } = useQuery<Delivery>({
    queryKey: ['/api/deliveries', deliveryId],
    queryFn: async () => {
      if (!deliveryId) return null;
      const response = await apiRequest('GET', `/api/deliveries/${deliveryId}`);
      if (!response.ok) {
        throw new Error('Failed to load delivery data');
      }
      return response.json();
    },
    enabled: !!deliveryId, // Only run query if deliveryId exists
  });

  // Process delivery data into map locations
  useEffect(() => {
    if (!delivery) return;

    try {
      const mapLocations: DeliveryLocation[] = [];

      // Add restaurant location if available
      if (delivery.pickupLocation) {
        mapLocations.push({
          id: `restaurant-${delivery.id}`,
          lat: delivery.pickupLocation.lat,
          lng: delivery.pickupLocation.lng,
          type: 'restaurant',
          name: 'Restaurant', // Would be replaced with actual restaurant name
        });
      }

      // Add customer location if available
      if (delivery.dropoffLocation) {
        mapLocations.push({
          id: `customer-${delivery.id}`,
          lat: delivery.dropoffLocation.lat,
          lng: delivery.dropoffLocation.lng,
          type: 'customer',
          name: 'Customer', // Would be replaced with actual customer name
        });
      }

      // Add vehicle location if available
      if (delivery.currentLocation) {
        mapLocations.push({
          id: `vehicle-${delivery.id}`,
          lat: delivery.currentLocation.lat,
          lng: delivery.currentLocation.lng,
          type: 'vehicle',
          vehicleType: (delivery.vehicleType?.toLowerCase() || 'car') as any,
          name: delivery.driverName || 'Delivery Driver',
          status: delivery.status,
          eta: delivery.dropoffEta || 'Calculating...',
          bearing: 0, // This would be calculated based on direction of travel
        });

        // Center map on vehicle
        setCenterLocation(delivery.currentLocation);
      } else if (delivery.pickupLocation) {
        // If no vehicle location, center on pickup
        setCenterLocation(delivery.pickupLocation);
      }

      setLocations(mapLocations);
      setError(null);
    } catch (err) {
      console.error('Error processing delivery data:', err);
      setError('Failed to process delivery data. Please try again.');
    }
  }, [delivery]);

  // For demo purposes, let's provide mock data if no delivery is available
  useEffect(() => {
    if (!deliveryId && locations.length === 0) {
      // This is sample data for demonstration when no real data is available
      const sampleLocations: DeliveryLocation[] = [
        {
          id: 'restaurant-demo',
          lat: 40.7128,
          lng: -74.0060,
          type: 'restaurant',
          name: 'Turkish Kebab Grill House',
        },
        {
          id: 'customer-demo',
          lat: 40.7357,
          lng: -73.9921,
          type: 'customer',
          name: 'Demo Customer',
        },
        {
          id: 'vehicle-demo',
          lat: 40.7229,
          lng: -74.0010,
          type: 'vehicle',
          vehicleType: 'scooter',
          name: 'Delivery Driver',
          status: 'On the way',
          eta: '15 mins',
          bearing: 45,
        },
      ];

      setLocations(sampleLocations);
      setCenterLocation({ lat: 40.7229, lng: -74.0010 });
    }
  }, [deliveryId, locations.length]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    refetch();
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Real-time Delivery Tracking</CardTitle>
          <CardDescription>
            {deliveryId
              ? `Tracking delivery ${deliveryId}`
              : 'View live location of active deliveries'}
          </CardDescription>
        </div>
        <Button variant="outline" onClick={handleRefresh} size="sm">
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="w-full h-[400px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <DeliveryMapView
            deliveryId={deliveryId}
            initialLocations={locations}
            centerLocation={centerLocation || { lat: 40.7128, lng: -74.0060 }}
            zoom={13}
            liveMode={true}
          />
        )}

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            {deliveryId
              ? 'This map shows the real-time location of the delivery vehicle, pickup location, and drop-off destination.'
              : 'Demonstration of real-time delivery tracking. In a real order, this would show the actual location of your delivery.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryTrackingMap;