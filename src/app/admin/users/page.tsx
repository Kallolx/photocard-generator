'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  plan: 'Free' | 'Basic' | 'Premium';
  status: 'active' | 'inactive' | 'suspended';
  joinedDate: string;
  subscriptionId: string;
  nextBillingDate: string;
  lastPayment: {
    amount: number;
    date: string;
    status: 'paid' | 'pending' | 'failed';
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      plan: 'Premium',
      status: 'active',
      joinedDate: '2024-01-15',
      subscriptionId: 'sub_1234567890',
      nextBillingDate: '2024-02-15',
      lastPayment: { amount: 29.99, date: '2024-01-15', status: 'paid' },
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      plan: 'Basic',
      status: 'active',
      joinedDate: '2024-02-20',
      subscriptionId: 'sub_0987654321',
      nextBillingDate: '2024-03-20',
      lastPayment: { amount: 9.99, date: '2024-02-20', status: 'paid' },
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      plan: 'Free',
      status: 'active',
      joinedDate: '2024-03-10',
      subscriptionId: '-',
      nextBillingDate: '-',
      lastPayment: { amount: 0, date: '-', status: 'paid' },
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@example.com',
      plan: 'Premium',
      status: 'inactive',
      joinedDate: '2023-12-05',
      subscriptionId: 'sub_1122334455',
      nextBillingDate: '-',
      lastPayment: { amount: 29.99, date: '2024-01-05', status: 'failed' },
    },
    {
      id: '5',
      name: 'Charlie Davis',
      email: 'charlie@example.com',
      plan: 'Basic',
      status: 'active',
      joinedDate: '2024-01-28',
      subscriptionId: 'sub_5544332211',
      nextBillingDate: '2024-02-28',
      lastPayment: { amount: 9.99, date: '2024-01-28', status: 'paid' },
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // TODO: Replace with actual API calls
  useEffect(() => {
    // Fetch users from API
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'Premium':
        return 'bg-[#8b6834] text-[#faf8f5]';
      case 'Basic':
        return 'bg-[#d4c4b0] text-[#2c2419]';
      default:
        return 'bg-[#f5f0e8] text-[#5d4e37]';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-[#4a7c59]';
      case 'inactive':
        return 'text-[#c19a6b]';
      case 'suspended':
        return 'text-[#8b6834]';
      default:
        return 'text-[#5d4e37]';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-[#4a7c59]';
      case 'pending':
        return 'text-[#8b6834]';
      case 'failed':
        return 'text-[#c19a6b]';
      default:
        return 'text-[#5d4e37]';
    }
  };

  const handleChangePlan = (userId: string, newPlan: 'Free' | 'Basic' | 'Premium') => {
    // TODO: Implement with proper API and Stripe integration
    setUsers(users.map(user => 
      user.id === userId ? { ...user, plan: newPlan } : user
    ));
  };

  const handleChangeStatus = (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    // TODO: Implement with proper authorization and logging
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-lora font-bold text-[#2c2419] mb-2">Users & Subscriptions</h2>
        <p className="text-[#5d4e37] font-inter">Manage user accounts, subscriptions, and payments</p>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-[#d4c4b0] p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-inter font-medium text-[#2c2419] mb-2">Search Users</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-[#faf8f5] border border-[#d4c4b0] text-[#2c2419] placeholder-[#5d4e37] font-inter focus:outline-none focus:ring-2 focus:ring-[#8b6834]"
            />
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-[#2c2419] mb-2">Filter by Plan</label>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="w-full px-4 py-2 bg-[#faf8f5] border border-[#d4c4b0] text-[#2c2419] font-inter focus:outline-none focus:ring-2 focus:ring-[#8b6834]"
            >
              <option value="all">All Plans</option>
              <option value="Free">Free</option>
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-[#2c2419] mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 bg-[#faf8f5] border border-[#d4c4b0] text-[#2c2419] font-inter focus:outline-none focus:ring-2 focus:ring-[#8b6834]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border-2 border-[#d4c4b0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f5f0e8]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-inter font-semibold text-[#2c2419]">User</th>
                <th className="px-6 py-3 text-left text-sm font-inter font-semibold text-[#2c2419]">Plan</th>
                <th className="px-6 py-3 text-left text-sm font-inter font-semibold text-[#2c2419]">Status</th>
                <th className="px-6 py-3 text-left text-sm font-inter font-semibold text-[#2c2419]">Last Payment</th>
                <th className="px-6 py-3 text-left text-sm font-inter font-semibold text-[#2c2419]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-[#d4c4b0] hover:bg-[#faf8f5]">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-inter font-medium text-[#2c2419]">{user.name}</p>
                      <p className="text-sm font-inter text-[#5d4e37]">{user.email}</p>
                      <p className="text-xs font-inter text-[#5d4e37] mt-1">Joined: {user.joinedDate}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-sm font-inter font-semibold ${getPlanBadgeColor(user.plan)}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-inter font-semibold ${getStatusColor(user.status)}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-inter text-[#2c2419]">${user.lastPayment.amount.toFixed(2)}</p>
                      <p className="text-xs font-inter text-[#5d4e37]">{user.lastPayment.date}</p>
                      <span className={`text-xs font-inter font-semibold ${getPaymentStatusColor(user.lastPayment.status)}`}>
                        {user.lastPayment.status.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-4 py-2 bg-[#8b6834] text-[#faf8f5] text-sm font-inter font-medium hover:bg-[#6b4e25]"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-[#5d4e37] font-inter">No users found matching your filters.</p>
          </div>
        )}
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-[#d4c4b0] max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-lora font-bold text-[#2c2419]">Manage User</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-[#5d4e37] hover:text-[#2c2419] text-2xl"
              >
                ×
              </button>
            </div>

            {/* User Info */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 pb-6 border-b-2 border-[#d4c4b0]">
                <div>
                  <label className="text-sm font-inter font-semibold text-[#5d4e37]">Name</label>
                  <p className="text-[#2c2419] font-inter mt-1">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-inter font-semibold text-[#5d4e37]">Email</label>
                  <p className="text-[#2c2419] font-inter mt-1">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-inter font-semibold text-[#5d4e37]">User ID</label>
                  <p className="text-[#2c2419] font-inter mt-1 text-sm">{selectedUser.id}</p>
                </div>
                <div>
                  <label className="text-sm font-inter font-semibold text-[#5d4e37]">Joined Date</label>
                  <p className="text-[#2c2419] font-inter mt-1">{selectedUser.joinedDate}</p>
                </div>
              </div>

              {/* Subscription Details */}
              <div>
                <h4 className="font-inter font-semibold text-[#2c2419] mb-4">Subscription Details</h4>
                <div className="bg-[#faf8f5] border border-[#d4c4b0] p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-inter text-[#5d4e37]">Current Plan</span>
                    <span className={`px-3 py-1 text-sm font-inter font-semibold ${getPlanBadgeColor(selectedUser.plan)}`}>
                      {selectedUser.plan}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-inter text-[#5d4e37]">Subscription ID</span>
                    <span className="text-sm font-inter font-medium text-[#2c2419]">{selectedUser.subscriptionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-inter text-[#5d4e37]">Next Billing Date</span>
                    <span className="text-sm font-inter font-medium text-[#2c2419]">{selectedUser.nextBillingDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-inter text-[#5d4e37]">Status</span>
                    <span className={`text-sm font-inter font-semibold ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <h4 className="font-inter font-semibold text-[#2c2419] mb-4">Last Payment</h4>
                <div className="bg-[#faf8f5] border border-[#d4c4b0] p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-inter text-[#5d4e37]">Amount</span>
                    <span className="text-sm font-inter font-medium text-[#2c2419]">
                      ${selectedUser.lastPayment.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-inter text-[#5d4e37]">Date</span>
                    <span className="text-sm font-inter font-medium text-[#2c2419]">{selectedUser.lastPayment.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-inter text-[#5d4e37]">Status</span>
                    <span className={`text-sm font-inter font-semibold ${getPaymentStatusColor(selectedUser.lastPayment.status)}`}>
                      {selectedUser.lastPayment.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Change Plan */}
              <div>
                <h4 className="font-inter font-semibold text-[#2c2419] mb-4">Change Subscription Plan</h4>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleChangePlan(selectedUser.id, 'Free')}
                    disabled={selectedUser.plan === 'Free'}
                    className="px-4 py-3 bg-[#f5f0e8] text-[#2c2419] font-inter font-medium hover:bg-[#e8dcc8] border border-[#d4c4b0] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Free
                  </button>
                  <button
                    onClick={() => handleChangePlan(selectedUser.id, 'Basic')}
                    disabled={selectedUser.plan === 'Basic'}
                    className="px-4 py-3 bg-[#d4c4b0] text-[#2c2419] font-inter font-medium hover:bg-[#c19a6b] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Basic
                  </button>
                  <button
                    onClick={() => handleChangePlan(selectedUser.id, 'Premium')}
                    disabled={selectedUser.plan === 'Premium'}
                    className="px-4 py-3 bg-[#8b6834] text-[#faf8f5] font-inter font-medium hover:bg-[#6b4e25] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Premium
                  </button>
                </div>
              </div>

              {/* Change Status */}
              <div>
                <h4 className="font-inter font-semibold text-[#2c2419] mb-4">Change Account Status</h4>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleChangeStatus(selectedUser.id, 'active')}
                    disabled={selectedUser.status === 'active'}
                    className="px-4 py-3 bg-[#4a7c59] text-white font-inter font-medium hover:bg-[#3d6849] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleChangeStatus(selectedUser.id, 'inactive')}
                    disabled={selectedUser.status === 'inactive'}
                    className="px-4 py-3 bg-[#c19a6b] text-white font-inter font-medium hover:bg-[#a67c4f] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleChangeStatus(selectedUser.id, 'suspended')}
                    disabled={selectedUser.status === 'suspended'}
                    className="px-4 py-3 bg-[#8b6834] text-[#faf8f5] font-inter font-medium hover:bg-[#6b4e25] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suspend
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-4">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full py-3 bg-[#f5f0e8] text-[#2c2419] font-inter font-semibold hover:bg-[#e8dcc8] border border-[#d4c4b0]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
