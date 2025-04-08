import { DashboardCard } from '@/components/ui/dashboard-card';

export function TopSellingItems() {
  return (
    <DashboardCard title="Top-Selling Items">
      <div className="space-y-4">
        {[
          { name: 'Cheeseburger Deluxe', amount: '$3,240', percentage: 15 },
          { name: 'Chicken Wings', amount: '$2,860', percentage: 12 },
          { name: 'Margherita Pizza', amount: '$2,150', percentage: 9 },
          { name: 'Caesar Salad', amount: '$1,720', percentage: 7 },
          { name: 'French Fries', amount: '$1,540', percentage: 6 }
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-blue/10 flex items-center justify-center">
                <span className="text-xs font-medium text-accent-blue">{index + 1}</span>
              </div>
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-text-secondary">{item.amount}</p>
              </div>
            </div>
            <div className="w-20 h-2 bg-bg-dark rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-blue rounded-full" 
                style={{ width: `${item.percentage * 5}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}