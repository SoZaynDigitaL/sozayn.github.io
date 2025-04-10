import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createVehicleIcon } from './deliveryIcons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Fix for default marker icon issue in react-leaflet
// This is needed because the CSS imports don't work properly with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Types
export interface DeliveryLocation {
  id: string;
  lat: number;
  lng: number;
  type: 'restaurant' | 'customer' | 'vehicle';
  name: string;
  vehicleType?: 'car' | 'truck' | 'scooter' | 'bicycle' | 'drone';
  status?: string;
  eta?: string;
  bearing?: number; // Direction in degrees (0-360)
}

interface DeliveryPath {
  id: string;
  waypoints: { lat: number; lng: number }[];
  progress: number; // 0-1 progress along the path
}

interface DeliveryMapViewProps {
  deliveryId?: string;
  initialLocations?: DeliveryLocation[];
  centerLocation?: { lat: number; lng: number };
  zoom?: number;
  liveMode?: boolean;
}

// Component to handle animated marker
const AnimatedDeliveryMarker = ({ 
  delivery, 
  path, 
  updatePosition 
}: { 
  delivery: DeliveryLocation; 
  path: DeliveryPath;
  updatePosition: (id: string, lat: number, lng: number, bearing: number) => void;
}) => {
  const map = useMap();
  const lastTimeRef = useRef(Date.now());
  const progressRef = useRef(path.progress || 0);
  const animationRef = useRef<number | null>(null);
  
  // Create custom icon based on vehicle type
  const iconUrl = delivery.vehicleType ? createVehicleIcon(delivery.vehicleType) : '';
  const vehicleIcon = L.icon({
    iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  useEffect(() => {
    if (!path.waypoints || path.waypoints.length < 2) return;
    
    const animate = (timestamp: number) => {
      const now = Date.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;
      
      // Speed of animation - adjust as needed
      const speed = 0.00005 * deltaTime;
      progressRef.current += speed;
      
      if (progressRef.current >= 1) {
        // Reset animation if needed or stop
        progressRef.current = 0;
      }
      
      // Calculate current position along the path
      const position = getPositionAlongPath(path.waypoints, progressRef.current);
      
      // Calculate bearing (direction)
      const nextPosition = getPositionAlongPath(
        path.waypoints, 
        Math.min(progressRef.current + 0.01, 1)
      );
      
      const bearing = calculateBearing(position, nextPosition);
      
      // Update the marker position
      updatePosition(delivery.id, position.lat, position.lng, bearing);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup animation on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [delivery.id, path.waypoints, updatePosition]);
  
  return (
    <Marker 
      position={[delivery.lat, delivery.lng]} 
      icon={vehicleIcon}
      rotationAngle={delivery.bearing || 0}
      rotationOrigin="center"
    >
      <Popup>
        <div>
          <h3 className="font-medium">{delivery.name}</h3>
          <p>Status: {delivery.status || 'In transit'}</p>
          {delivery.eta && <p>ETA: {delivery.eta}</p>}
        </div>
      </Popup>
    </Marker>
  );
};

// Helper function to calculate position along a path
function getPositionAlongPath(
  waypoints: { lat: number; lng: number }[],
  progress: number
): { lat: number; lng: number } {
  // If at the beginning, return first waypoint
  if (progress <= 0) return waypoints[0];
  // If at the end, return last waypoint
  if (progress >= 1) return waypoints[waypoints.length - 1];
  
  // Calculate which segment we're on
  const numSegments = waypoints.length - 1;
  const segmentProgress = progress * numSegments;
  const segmentIndex = Math.floor(segmentProgress);
  const segmentFraction = segmentProgress - segmentIndex;
  
  // Interpolate between waypoints in the current segment
  const start = waypoints[segmentIndex];
  const end = waypoints[segmentIndex + 1];
  
  return {
    lat: start.lat + (end.lat - start.lat) * segmentFraction,
    lng: start.lng + (end.lng - start.lng) * segmentFraction
  };
}

// Calculate bearing between two points
function calculateBearing(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): number {
  const startLat = start.lat * Math.PI / 180;
  const endLat = end.lat * Math.PI / 180;
  const diffLng = (end.lng - start.lng) * Math.PI / 180;
  
  const y = Math.sin(diffLng) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) -
            Math.sin(startLat) * Math.cos(endLat) * Math.cos(diffLng);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  if (bearing < 0) bearing += 360;
  
  return bearing;
}

// Main Map Component
const DeliveryMapView: React.FC<DeliveryMapViewProps> = ({
  deliveryId,
  initialLocations = [],
  centerLocation = { lat: 40.7128, lng: -74.0060 }, // NYC default
  zoom = 13,
  liveMode = true
}) => {
  const [locations, setLocations] = useState<DeliveryLocation[]>(initialLocations);
  const [paths, setPaths] = useState<DeliveryPath[]>([]);
  
  // Update position of a specific marker
  const updatePosition = (id: string, lat: number, lng: number, bearing: number) => {
    setLocations(prev => 
      prev.map(loc => 
        loc.id === id 
          ? { ...loc, lat, lng, bearing } 
          : loc
      )
    );
  };
  
  // Set up sample data if none provided
  useEffect(() => {
    if (locations.length === 0) {
      const sampleData: DeliveryLocation[] = [
        {
          id: 'restaurant-1',
          lat: 40.7128,
          lng: -74.0060,
          type: 'restaurant',
          name: 'Turkish Kebab Grill House'
        },
        {
          id: 'customer-1',
          lat: 40.7357,
          lng: -73.9921,
          type: 'customer',
          name: 'John Doe'
        },
        {
          id: 'delivery-1',
          lat: 40.7229,
          lng: -74.0010,
          type: 'vehicle',
          vehicleType: 'scooter',
          name: 'Delivery Driver',
          status: 'On the way',
          eta: '15 mins',
          bearing: 45
        }
      ];
      
      setLocations(sampleData);
      
      // Sample delivery path
      const samplePath: DeliveryPath = {
        id: 'path-1',
        waypoints: [
          { lat: 40.7128, lng: -74.0060 }, // Restaurant
          { lat: 40.7229, lng: -74.0010 }, // Waypoint 1
          { lat: 40.7280, lng: -73.9980 }, // Waypoint 2
          { lat: 40.7357, lng: -73.9921 }  // Customer
        ],
        progress: 0
      };
      
      setPaths([samplePath]);
    }
  }, [locations.length]);
  
  // If in live mode, we would fetch updates from the server
  useEffect(() => {
    if (!liveMode || !deliveryId) return;
    
    // In a real app, set up WebSocket or polling to get real-time updates
    const interval = setInterval(() => {
      // This would be replaced with actual API calls
      // For now, we'll just simulate random movement for demo purposes
      if (locations.length > 0) {
        const vehicleLocations = locations.filter(loc => loc.type === 'vehicle');
        if (vehicleLocations.length > 0) {
          setLocations(prev => 
            prev.map(loc => {
              if (loc.type === 'vehicle') {
                // Simulate small random movement
                const latJitter = (Math.random() - 0.5) * 0.001;
                const lngJitter = (Math.random() - 0.5) * 0.001;
                return {
                  ...loc,
                  lat: loc.lat + latJitter,
                  lng: loc.lng + lngJitter
                };
              }
              return loc;
            })
          );
        }
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [liveMode, deliveryId, locations]);
  
  return (
    <Card className="w-full h-[500px] overflow-hidden">
      <CardHeader>
        <CardTitle>Real-time Delivery Tracking</CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[450px]">
        <MapContainer 
          center={[centerLocation.lat, centerLocation.lng]} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Static markers for restaurants and customers */}
          {locations
            .filter(loc => loc.type !== 'vehicle')
            .map(location => (
              <Marker 
                key={location.id} 
                position={[location.lat, location.lng]}
                icon={L.divIcon({
                  className: 'custom-icon',
                  html: `<div class="${location.type === 'restaurant' 
                    ? 'bg-blue-500' 
                    : 'bg-green-500'} w-4 h-4 rounded-full"></div>`,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                })}
              >
                <Popup>
                  <div>
                    <h3 className="font-medium">{location.name}</h3>
                    <p>{location.type === 'restaurant' ? 'Pickup location' : 'Delivery destination'}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          
          {/* Animated vehicle markers */}
          {locations
            .filter(loc => loc.type === 'vehicle')
            .map(vehicle => {
              // Find matching path for this vehicle
              const vehiclePath = paths.find(p => p.id === `path-${vehicle.id.split('-')[1]}`) || 
                { id: '', waypoints: [], progress: 0 };
              
              return (
                <AnimatedDeliveryMarker 
                  key={vehicle.id}
                  delivery={vehicle}
                  path={vehiclePath}
                  updatePosition={updatePosition}
                />
              );
            })}
        </MapContainer>
      </CardContent>
    </Card>
  );
};

export default DeliveryMapView;