import { apiRequest } from './queryClient';

// Define necessary types here since we can't import from the schema
export type Customer = {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  userId: number;
  pointsBalance?: number;
  totalOrders?: number;
  totalSpent?: number;
  isActive: boolean;
  createdAt: string;
}

export type InsertCustomer = {
  name?: string;
  email: string;
  phone?: string;
  userId: number;
  isActive: boolean;
}

export async function fetchCustomers(): Promise<Customer[]> {
  const response = await apiRequest('GET', '/api/customers');
  return await response.json();
}

export async function fetchCustomer(id: number): Promise<Customer> {
  const response = await apiRequest('GET', `/api/customers/${id}`);
  return await response.json();
}

export async function createCustomer(data: InsertCustomer): Promise<Customer> {
  const response = await apiRequest('POST', '/api/customers', data);
  return await response.json();
}

export async function updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
  const response = await apiRequest('PATCH', `/api/customers/${id}`, data);
  return await response.json();
}

export async function deleteCustomer(id: number): Promise<void> {
  await apiRequest('DELETE', `/api/customers/${id}`);
}

export async function toggleCustomerStatus(id: number, isActive: boolean): Promise<Customer> {
  const response = await apiRequest('PATCH', `/api/customers/${id}/status`, { isActive });
  return await response.json();
}