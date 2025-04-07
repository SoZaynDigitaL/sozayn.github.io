import { Package, Check, Truck, UtensilsCrossed, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type OrderStatus = 'received' | 'prepared' | 'picked_up' | 'in_transit' | 'delivered';

const steps = [
  {
    id: 'received',
    title: 'Order Received',
    icon: Clock,
    description: 'The order has been received and is being processed.',
  },
  {
    id: 'prepared',
    title: 'Prepared',
    icon: UtensilsCrossed,
    description: 'The food is being prepared in the kitchen.',
  },
  {
    id: 'picked_up',
    title: 'Picked Up',
    icon: Package,
    description: 'The delivery driver has picked up the order.',
  },
  {
    id: 'in_transit',
    title: 'In Transit',
    icon: Truck,
    description: 'The order is on the way to the customer.',
  },
  {
    id: 'delivered',
    title: 'Delivered',
    icon: Check,
    description: 'The order has been delivered to the customer.',
  },
];

const statusMap: Record<OrderStatus, number> = {
  received: 0,
  prepared: 1,
  picked_up: 2,
  in_transit: 3,
  delivered: 4,
};

export function OrderTracking({ currentStatus = 'received' }: { currentStatus?: OrderStatus }) {
  const currentStep = statusMap[currentStatus];
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index <= currentStep;
          const isCurrentStep = index === currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center relative">
              {/* Step icon */}
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 z-10", 
                  isActive 
                    ? "bg-accent-blue border-accent-blue text-white" 
                    : "bg-bg-dark border-border-color text-text-secondary"
                )}
              >
                <step.icon className="h-5 w-5" />
              </div>
              
              {/* Step title */}
              <div className="mt-2 text-center">
                <p 
                  className={cn(
                    "font-medium text-sm", 
                    isActive ? "text-text-primary" : "text-text-secondary"
                  )}
                >
                  {step.title}
                </p>
              </div>
              
              {/* Connecting line - on all except last step */}
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "absolute h-[2px] w-full top-5 right-0 -mr-2 transform translate-x-1/2",
                    isActive && index < currentStep 
                      ? "bg-accent-blue" 
                      : "bg-border-color"
                  )}
                  style={{ width: 'calc(100% - 1rem)' }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Description of the current status */}
      <div className="mt-6 text-center">
        <p className="text-text-secondary">
          {steps[currentStep].description}
        </p>
      </div>
    </div>
  );
}