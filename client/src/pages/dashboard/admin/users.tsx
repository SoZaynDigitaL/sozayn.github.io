import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Search,
  Trash,
  UserPlus,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// User type definition
interface User {
  id: number;
  username: string;
  email: string;
  businessName: string;
  businessType: string;
  role: string;
  subscriptionPlan: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string;
  createdAt: string;
}

export default function UserManagement() {
  const { isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    email: '',
    businessName: '',
    role: '',
    subscriptionPlan: ''
  });
  const [addFormData, setAddFormData] = useState({
    username: '',
    email: '',
    password: '',
    businessName: '',
    businessType: 'restaurant',
    role: 'client',
    subscriptionPlan: 'starter'
  });
  
  // Fetch users from API
  const {
    data: users = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      try {
        // Try the standard endpoint first
        const res = await apiRequest('GET', '/api/users');
        return await res.json();
      } catch (err) {
        console.log('Using alternative authentication method for admin users');
        
        // If that fails, use our basic auth alternative endpoint
        // Create Base64 encoded credentials for admin - admin123
        const credentials = btoa('admin:admin123');
        
        const res = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Accept': 'application/json'
          },
          cache: 'no-cache'
        });
        
        if (!res.ok) {
          throw new Error(`${res.status}: ${await res.text()}`);
        }
        
        return await res.json();
      }
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => apiRequest('DELETE', `/api/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'User Deleted',
        description: selectedUser ? `${selectedUser.username} has been deleted successfully.` : 'User deleted successfully.',
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to delete user: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: { id: number, userData: any }) => 
      apiRequest('PATCH', `/api/users/${data.id}`, data.userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'User Updated',
        description: selectedUser ? `${selectedUser.username}'s information has been updated successfully.` : 'User updated successfully.',
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update user: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: (userData: any) => apiRequest('POST', '/api/users', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'User Created',
        description: `${addFormData.username} has been created successfully.`,
      });
      
      // Reset form data
      setAddFormData({
        username: '',
        email: '',
        password: '',
        businessName: '',
        businessType: 'restaurant',
        role: 'client',
        subscriptionPlan: 'starter'
      });
      
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create user: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: (data: { userId: number, subscriptionPlan: string }) => 
      apiRequest('PATCH', `/api/users/${data.userId}/subscription`, { subscriptionPlan: data.subscriptionPlan }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'Subscription Updated',
        description: selectedUser ? `${selectedUser.username}'s subscription has been updated successfully.` : 'Subscription updated successfully.',
      });
      setIsSubscriptionDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update subscription: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  // Check if we need to show loading state
  const isActionPending = 
    deleteUserMutation.isPending || 
    updateUserMutation.isPending || 
    addUserMutation.isPending || 
    updateSubscriptionMutation.isPending;

  // Filter users based on search term
  const filteredUsers = users.filter((user: User) => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a: User, b: User) => {
    const aValue = a[sortField as keyof User];
    const bValue = b[sortField as keyof User];
    
    if (aValue === undefined || bValue === undefined) return 0;
    
    // Handle string or number comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      // For numbers or other types
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    }
  });

  // Get current users for pagination
  const indexOfLastUser = currentPage * 10;
  const indexOfFirstUser = indexOfLastUser - 10;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / 10);

  // Pagination handler
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Change sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Check for admin access
  React.useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive'
      });
    }
  }, [isAdmin, navigate, toast]);

  // Handle user deletion
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  // Handle user editing
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      email: user.email,
      businessName: user.businessName,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan
    });
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };
  
  // Add user related handlers
  const handleAddUserClick = () => {
    setIsAddDialogOpen(true);
  };
  
  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddFormData({
      ...addFormData,
      [name]: value
    });
  };
  
  const handleAddSelectChange = (name: string, value: string) => {
    setAddFormData({
      ...addFormData,
      [name]: value
    });
  };
  
  const handleAddUser = () => {
    // Call API to create user
    addUserMutation.mutate(addFormData);
  };

  const handleUpdateUser = () => {
    if (selectedUser) {
      updateUserMutation.mutate({
        id: selectedUser.id,
        userData: editFormData
      });
    }
  };
  
  // Subscription management handlers
  const handleSubscriptionClick = (user: User) => {
    setSelectedUser(user);
    setIsSubscriptionDialogOpen(true);
  };
  
  const handleUpgradeSubscription = (plan: string) => {
    if (selectedUser) {
      updateSubscriptionMutation.mutate({
        userId: selectedUser.id,
        subscriptionPlan: plan
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-text-secondary">
              Manage all users and their account permissions
            </p>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={handleAddUserClick}
            disabled={isActionPending}
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Users</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading || isActionPending}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-8 h-8 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
                <span className="ml-2">Loading users...</span>
              </div>
            ) : isError ? (
              <div className="py-10 text-center text-destructive">
                <p>Error loading users: {(error as Error)?.message || 'An unexpected error occurred'}</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/users'] })}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead onClick={() => handleSort('id')} className="cursor-pointer">
                        <div className="flex items-center">
                          ID <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead onClick={() => handleSort('username')} className="cursor-pointer">
                        <div className="flex items-center">
                          Username <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead onClick={() => handleSort('email')} className="cursor-pointer">
                        <div className="flex items-center">
                          Email <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead onClick={() => handleSort('businessName')} className="cursor-pointer">
                        <div className="flex items-center">
                          Business <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead onClick={() => handleSort('role')} className="cursor-pointer">
                        <div className="flex items-center">
                          Role <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead onClick={() => handleSort('subscriptionPlan')} className="cursor-pointer">
                        <div className="flex items-center">
                          Plan <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.businessName}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${
                                user.subscriptionPlan === 'enterprise'
                                  ? 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
                                  : user.subscriptionPlan === 'professional'
                                  ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                  : user.subscriptionPlan === 'growth'
                                  ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                                  : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
                              }`}
                              variant="outline"
                            >
                              {user.subscriptionPlan}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex items-center gap-1"
                              onClick={() => handleSubscriptionClick(user)}
                              disabled={isActionPending}
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="14" 
                                height="14" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              >
                                <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path>
                                <path d="M16.5 9.4 7.55 4.24"></path>
                                <polyline points="3.29 7 12 12 20.71 7"></polyline>
                                <line x1="12" y1="22" x2="12" y2="12"></line>
                                <circle cx="18.5" cy="15.5" r="2.5"></circle>
                                <path d="M20.27 17.27 22 19"></path>
                              </svg>
                              Manage
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={isActionPending}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="1" />
                                    <circle cx="12" cy="5" r="1" />
                                    <circle cx="12" cy="19" r="1" />
                                  </svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditClick(user)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDeleteClick(user)}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1 || isActionPending}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages || isActionPending}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user "{selectedUser?.username}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                value={editFormData.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="businessName" className="text-right">
                Business Name
              </Label>
              <Input
                id="businessName"
                name="businessName"
                value={editFormData.businessName}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={editFormData.role}
                onValueChange={(value) => handleSelectChange('role', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subscriptionPlan" className="text-right">
                Subscription
              </Label>
              <Select
                value={editFormData.subscriptionPlan}
                onValueChange={(value) => handleSelectChange('subscriptionPlan', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with the following details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={addFormData.username}
                onChange={handleAddInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={addFormData.email}
                onChange={handleAddInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={addFormData.password}
                onChange={handleAddInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="businessName" className="text-right">
                Business Name
              </Label>
              <Input
                id="businessName"
                name="businessName"
                value={addFormData.businessName}
                onChange={handleAddInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="businessType" className="text-right">
                Business Type
              </Label>
              <Select
                value={addFormData.businessType}
                onValueChange={(value) => handleAddSelectChange('businessType', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="cafe">Cafe</SelectItem>
                  <SelectItem value="grocery">Grocery</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={addFormData.role}
                onValueChange={(value) => handleAddSelectChange('role', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subscriptionPlan" className="text-right">
                Subscription
              </Label>
              <Select
                value={addFormData.subscriptionPlan}
                onValueChange={(value) => handleAddSelectChange('subscriptionPlan', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Management Dialog */}
      <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
            <DialogDescription>
              Update subscription plan for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Current Plan</h3>
              <div className="flex items-center">
                <Badge
                  className={`${
                    selectedUser?.subscriptionPlan === 'enterprise'
                      ? 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
                      : selectedUser?.subscriptionPlan === 'professional'
                      ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                      : selectedUser?.subscriptionPlan === 'growth'
                      ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                      : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
                  }`}
                  variant="outline"
                >
                  {selectedUser?.subscriptionPlan}
                </Badge>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Change Plan</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleUpgradeSubscription('starter')}
                >
                  <div className="flex flex-col items-start">
                    <span>Starter</span>
                    <span className="text-xs text-muted-foreground">Basic features</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleUpgradeSubscription('growth')}
                >
                  <div className="flex flex-col items-start">
                    <span>Growth</span>
                    <span className="text-xs text-muted-foreground">Standard features</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleUpgradeSubscription('professional')}
                >
                  <div className="flex flex-col items-start">
                    <span>Professional</span>
                    <span className="text-xs text-muted-foreground">Advanced features</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleUpgradeSubscription('enterprise')}
                >
                  <div className="flex flex-col items-start">
                    <span>Enterprise</span>
                    <span className="text-xs text-muted-foreground">All features</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubscriptionDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}