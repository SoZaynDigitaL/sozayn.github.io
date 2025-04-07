import { useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';

interface ChartProps {
  data: any;
}

export function OrdersChart({ data }: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    // Only import Chart.js on the client side
    import('chart.js').then(({ Chart, registerables }) => {
      Chart.register(...registerables);
      
      if (chartRef.current) {
        // Destroy existing chart if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        // Create simulated data if no data is provided
        const chartData = data || {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          values: [320, 410, 385, 450]
        };

        // Create new chart instance
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
          chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: chartData.labels,
              datasets: [{
                label: 'Orders',
                data: chartData.values,
                backgroundColor: '#4361ee',
                borderRadius: 6,
                barThickness: 20,
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: '#131a29',
                  padding: 12,
                  bodyFont: {
                    size: 14
                  },
                  titleFont: {
                    size: 14,
                    weight: 'bold'
                  }
                }
              },
              scales: {
                x: {
                  grid: {
                    display: false
                  }
                },
                y: {
                  beginAtZero: true,
                  border: {
                    display: false
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                  }
                }
              }
            }
          });
        }
      }
    });

    // Clean up function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div>
      <canvas ref={chartRef} />
    </div>
  );
}

export function RevenueChart({ data }: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    import('chart.js').then(({ Chart, registerables }) => {
      Chart.register(...registerables);
      
      if (chartRef.current) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        // Create simulated data if no data is provided
        const chartData = data || {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          values: [1200, 1900, 2300, 2800, 2400, 2800]
        };

        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
          chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels: chartData.labels,
              datasets: [{
                label: 'Revenue ($)',
                data: chartData.values,
                borderColor: '#8957e5',
                backgroundColor: 'rgba(137, 87, 229, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#8957e5',
                pointBorderColor: '#131a29',
                pointBorderWidth: 2,
                pointRadius: 4
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: '#131a29',
                  titleColor: '#fff',
                  bodyColor: '#fff',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 1
                }
              },
              scales: {
                x: {
                  grid: {
                    display: false
                  }
                },
                y: {
                  beginAtZero: true,
                  border: {
                    display: false
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                  },
                  ticks: {
                    callback: function(value) {
                      return '$' + value;
                    }
                  }
                }
              }
            }
          });
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div>
      <canvas ref={chartRef} />
    </div>
  );
}

export function CustomersChart({ data }: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    import('chart.js').then(({ Chart, registerables }) => {
      Chart.register(...registerables);
      
      if (chartRef.current) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        // Create simulated data if no data is provided
        const chartData = data || {
          labels: ['New', 'Returning'],
          values: [42, 58]
        };

        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
          chartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: chartData.labels,
              datasets: [{
                data: chartData.values,
                backgroundColor: ['#4361ee', '#2ea043'],
                borderWidth: 0,
                borderRadius: 0
              }]
            },
            options: {
              responsive: true,
              cutout: '70%',
              circumference: 180,
              rotation: -90,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    boxWidth: 15,
                    padding: 15,
                    color: '#fff'
                  }
                },
                tooltip: {
                  backgroundColor: '#131a29',
                  padding: 12,
                  titleFont: {
                    size: 14,
                    weight: 'bold'
                  },
                  bodyFont: {
                    size: 13
                  },
                  callbacks: {
                    label: function(context) {
                      return ` ${context.label}: ${context.parsed}%`;
                    }
                  }
                }
              }
            }
          });
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="flex justify-center items-center h-full">
      <canvas ref={chartRef} />
    </div>
  );
}

export function DashboardCharts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>
          View your business performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="orders">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="h-[300px]">
            <OrdersChart data={null} />
          </TabsContent>
          <TabsContent value="revenue" className="h-[300px]">
            <RevenueChart data={null} />
          </TabsContent>
          <TabsContent value="customers" className="h-[300px]">
            <CustomersChart data={null} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}