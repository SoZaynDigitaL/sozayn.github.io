import { cn } from '@/lib/utils';

export type OrderStatus = 'received' | 'prepared' | 'picked_up' | 'in_transit' | 'delivered';

const orderStatusSteps: OrderStatus[] = ['received', 'prepared', 'picked_up', 'in_transit', 'delivered'];

const statusLabels: Record<OrderStatus, string> = {
  received: 'Received',
  prepared: 'Prepared',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered'
};

interface OrderTrackingProps {
  currentStatus: OrderStatus;
  className?: string;
}

export function OrderTracking({ currentStatus, className }: OrderTrackingProps) {
  // Find the index of the current status
  const currentIndex = orderStatusSteps.findIndex(status => status === currentStatus);
  
  return (
    <div className={cn("mb-6", className)}>
      <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Order Status</h3>
      
      <div className="relative mb-6">
        {/* Background track line */}
        <div className="absolute top-3 left-[10%] right-[10%] h-0.5 bg-border-color z-[1]"></div>
        
        {/* Progress line */}
        <div 
          className="absolute top-3 left-[10%] h-0.5 bg-accent-blue z-[2]"
          style={{ 
            width: `${Math.min(100, currentIndex/(orderStatusSteps.length-1)*100)}%` 
          }}
        ></div>
        
        {/* Status steps */}
        <div className="flex justify-between relative z-[3]">
          {orderStatusSteps.map((status, index) => {
            const isCompleted = index <= currentIndex;
            const isActive = index === currentIndex;
            
            return (
              <div key={status} className="flex flex-col items-center w-[20%]">
                <div 
                  className={cn(
                    "w-6 h-6 rounded-full mb-2 flex items-center justify-center text-xs",
                    isCompleted ? "bg-accent-blue border-2 border-accent-blue" : 
                    isActive ? "bg-bg-chart border-2 border-accent-blue" : 
                    "bg-bg-dark border-2 border-border-color"
                  )}
                >
                  {isCompleted && index < currentIndex && (
                    <span className="text-white">✓</span>
                  )}
                  {isActive && (
                    <span className="text-accent-blue">{index + 1}</span>
                  )}
                </div>
                <span 
                  className={cn(
                    "text-xs text-center",
                    isCompleted || isActive ? "text-text-primary font-medium" : "text-text-secondary"
                  )}
                >
                  {statusLabels[status]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
