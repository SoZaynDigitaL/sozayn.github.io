import { useAuth } from '@/hooks/useAuth';
import ClientDashboardLayout from '@/components/layout/ClientDashboardLayout';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import OrdersList from '@/components/dashboard/OrdersList';

export default function Orders() {
  const { user } = useAuth();
  
  const Layout = user?.role === 'admin' ? AdminDashboardLayout : ClientDashboardLayout;

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <p className="mb-6">Manage all your restaurant orders in one place.</p>
        <OrdersList />
      </div>
    </Layout>
  );
}
