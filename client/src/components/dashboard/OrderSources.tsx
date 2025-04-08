import { DashboardCard } from '@/components/ui/dashboard-card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export function OrderSources() {
  return (
    <DashboardCard title="Order Sources">
      <div className="h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={[
              { name: 'Website', value: 40 },
              { name: 'DoorDash', value: 28 },
              { name: 'UberEats', value: 22 },
              { name: 'Grubhub', value: 18 },
              { name: 'Phone', value: 12 }
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
            <XAxis 
              type="number" 
              axisLine={{ stroke: 'var(--border-color)' }} 
              tick={{ fill: 'var(--text-secondary)' }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              axisLine={{ stroke: 'var(--border-color)' }} 
              tick={{ fill: 'var(--text-secondary)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--bg-card)', 
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              itemStyle={{ color: 'var(--text-primary)' }}
              labelStyle={{ color: 'var(--text-primary)' }}
              formatter={(value: number) => [`${value}%`, 'Percentage']}
            />
            <Bar 
              dataKey="value" 
              fill="var(--accent-purple)" 
              radius={[0, 4, 4, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}