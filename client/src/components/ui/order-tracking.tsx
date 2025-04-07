import { Check } from 'lucide-react';

interface OrderTrackingProps {
  currentStatus: string;
}

export function OrderTracking({ currentStatus }: OrderTrackingProps) {
  // Define all possible statuses in order
  const statuses = [
    { id: 'received', label: 'Order Received' },
    { id: 'prepared', label: 'Prepared' },
    { id: 'picked_up', label: 'Picked Up' },
    { id: 'in_transit', label: 'In Transit' },
    { id: 'delivered', label: 'Delivered' }
  ];
  
  // Find the index of the current status
  const currentIndex = statuses.findIndex(status => status.id === currentStatus);
  
  return (
    <div className="w-full">
      {/* Track Line */}
      <div className="flex justify-between items-center relative">
        {/* Connecting Line */}
        <div className="absolute h-1 bg-accent-blue/20 left-0 top-1/2 transform -translate-y-1/2 w-full" />
        
        {/* Filled Progress */}
        <div 
          className="absolute h-1 bg-accent-blue left-0 top-1/2 transform -translate-y-1/2" 
          style={{ 
            width: `${currentIndex >= 0 ? Math.min(100, (currentIndex / (statuses.length - 1)) * 100) : 0}%` 
          }} 
        />
        
        {/* Status Markers */}
        {statuses.map((status, index) => {
          const isComplete = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={status.id} className="relative flex flex-col items-center z-10">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isComplete ? 'bg-accent-blue text-white' : 'bg-bg-chart text-text-secondary'
                } ${
                  isCurrent ? 'ring-4 ring-accent-blue/30' : ''
                }`}
              >
                {isComplete ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <span 
                className={`text-xs mt-2 text-center w-20 ${
                  isComplete ? 'text-text-primary font-medium' : 'text-text-secondary'
                }`}
              >
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}