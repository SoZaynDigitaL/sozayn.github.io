import DashboardLayout from '@/components/layout/DashboardLayout';
import OrdersList from '@/components/dashboard/OrdersList';

export default function Orders() {
  return (
    <DashboardLayout>
      <OrdersList />
    </DashboardLayout>
  );
}
