import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

// Fix Leaflet icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom vehicle icons
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3774/3774278.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const restaurantIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/562/562678.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const customerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface Delivery {
  id: number;
  delivery_id: string;
  status: string;
  provider: string;
  pickup_name: string;
  pickup_address: string;
  pickup_phone: string;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  dropoff_name: string;
  dropoff_address: string;
  dropoff_phone: string;
  dropoff_latitude: number | null;
  dropoff_longitude: number | null;
  tracking_url: string | null;
  created_at: string;
  updated_at: string | null;
  // Add vehicle position if available from tracking API
  vehicle_latitude?: number | null;
  vehicle_longitude?: number | null;
}

interface DeliveryTrackingMapProps {
  activeDeliveryId?: string;
}

export default function DeliveryTrackingMap({ activeDeliveryId }: DeliveryTrackingMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // NYC default
  const [zoom, setZoom] = useState(11);

  // Query to fetch active deliveries
  const {
    data: deliveries,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/deliveries/active'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/deliveries?status=active');
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Find active delivery if ID is provided
  const activeDelivery = activeDeliveryId && deliveries
    ? deliveries.find((d: Delivery) => d.delivery_id === activeDeliveryId)
    : null;

  // Update map center when active delivery changes
  useEffect(() => {
    if (activeDelivery && activeDelivery.vehicle_latitude && activeDelivery.vehicle_longitude) {
      // Center on vehicle location if available
      setMapCenter([activeDelivery.vehicle_latitude, activeDelivery.vehicle_longitude]);
      setZoom(14);
    } else if (activeDelivery && activeDelivery.pickup_latitude && activeDelivery.pickup_longitude) {
      // Fallback to pickup location
      setMapCenter([activeDelivery.pickup_latitude, activeDelivery.pickup_longitude]);
      setZoom(12);
    } else if (deliveries && deliveries.length > 0) {
      // Calculate average center of all deliveries
      const validDeliveries = deliveries.filter(
        (d: Delivery) => d.pickup_latitude && d.pickup_longitude
      );
      
      if (validDeliveries.length > 0) {
        const latSum = validDeliveries.reduce(
          (sum: number, d: Delivery) => sum + (d.pickup_latitude || 0),
          0
        );
        const lngSum = validDeliveries.reduce(
          (sum: number, d: Delivery) => sum + (d.pickup_longitude || 0),
          0
        );
        
        setMapCenter([latSum / validDeliveries.length, lngSum / validDeliveries.length]);
        setZoom(11);
      }
    }
  }, [activeDelivery, deliveries]);

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pickup': return 'bg-yellow-500';
      case 'in_transit': return 'bg-blue-500';
      case 'dropoff': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Delivery Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">
            Error loading deliveries: {(error as Error).message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!deliveries || deliveries.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Delivery Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No active deliveries found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Live Delivery Tracking</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] w-full">
          <MapContainer
            center={mapCenter}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {deliveries.map((delivery: Delivery) => {
              // Only show deliveries with valid coordinates
              if (!delivery.pickup_latitude || !delivery.pickup_longitude ||
                  !delivery.dropoff_latitude || !delivery.dropoff_longitude) {
                return null;
              }

              // Route path
              const routePoints: [number, number][] = [];
              routePoints.push([delivery.pickup_latitude, delivery.pickup_longitude]);
              
              // Add vehicle position if available
              if (delivery.vehicle_latitude && delivery.vehicle_longitude) {
                routePoints.push([delivery.vehicle_latitude, delivery.vehicle_longitude]);
              }
              
              routePoints.push([delivery.dropoff_latitude, delivery.dropoff_longitude]);
              
              const isActive = activeDeliveryId === delivery.delivery_id;
              const routeColor = isActive ? '#4361ee' : '#6b7280';
              const routeWeight = isActive ? 4 : 2;
              
              return (
                <React.Fragment key={delivery.id}>
                  {/* Pickup marker */}
                  <Marker 
                    position={[delivery.pickup_latitude, delivery.pickup_longitude]}
                    icon={restaurantIcon}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{delivery.pickup_name}</p>
                        <p>{delivery.pickup_address}</p>
                        <p className="mt-1">
                          <Badge className={getStatusColor(delivery.status)}>
                            {delivery.status.replace('_', ' ')}
                          </Badge>
                        </p>
                        <p className="mt-1 text-xs">
                          Created: {formatTimeAgo(delivery.created_at)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Dropoff marker */}
                  <Marker 
                    position={[delivery.dropoff_latitude, delivery.dropoff_longitude]}
                    icon={customerIcon}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{delivery.dropoff_name}</p>
                        <p>{delivery.dropoff_address}</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Vehicle marker if available */}
                  {delivery.vehicle_latitude && delivery.vehicle_longitude && (
                    <Marker 
                      position={[delivery.vehicle_latitude, delivery.vehicle_longitude]}
                      icon={truckIcon}
                    >
                      <Popup>
                        <div className="text-sm">
                          <p className="font-semibold">
                            Delivery #{delivery.delivery_id.slice(-6)}
                          </p>
                          <p>Provider: {delivery.provider}</p>
                          <p className="mt-1">
                            <Badge className={getStatusColor(delivery.status)}>
                              {delivery.status.replace('_', ' ')}
                            </Badge>
                          </p>
                          {delivery.tracking_url && (
                            <p className="mt-1">
                              <a 
                                href={delivery.tracking_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary underline text-xs"
                              >
                                External tracking
                              </a>
                            </p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Route line */}
                  <Polyline 
                    positions={routePoints} 
                    color={routeColor} 
                    weight={routeWeight}
                    dashArray={delivery.status === 'completed' ? '4' : undefined}
                  />
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}