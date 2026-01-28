'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { adminAPI } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  plan: 'Free' | 'Basic' | 'Premium';
  status: 'active' | 'inactive';
  created_at: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'Free' | 'Basic' | 'Premium'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, planFilter, statusFilter, currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 20,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (planFilter !== 'all') params.plan = planFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await adminAPI.getUsers(params);
      if (response.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'premium':
        return 'bg-[#8b6834] text-white';
      case 'basic':
        return 'bg-[#d4c4b0] text-[#2c2419]';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' ? 'bg-[#4a7c59] text-white' : 'bg-gray-300 text-gray-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-lora font-bold text-[#2c2419]">Users</h2>
        <p className="text-[#5d4e37] font-inter mt-1">Manage all users and their subscriptions</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6834] w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 border-2 border-[#d4c4b0] font-inter text-[#2c2419] placeholder-[#8b6834]/40 focus:outline-none focus:border-[#8b6834]"
          />
        </div>

        <select
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value as typeof planFilter);
            setCurrentPage(1);
          }}
          className="px-4 py-3 border-2 border-[#d4c4b0] font-inter text-[#2c2419] bg-white focus:outline-none focus:border-[#8b6834] cursor-pointer"
        >
          <option value="all">All Plans</option>
          <option value="Free">Free</option>
          <option value="Basic">Basic</option>
          <option value="Premium">Premium</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as typeof statusFilter);
            setCurrentPage(1);
          }}
          className="px-4 py-3 border-2 border-[#d4c4b0] font-inter text-[#2c2419] bg-white focus:outline-none focus:border-[#8b6834] cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#d4c4b0] border-t-[#8b6834]"></div>
            <p className="mt-4 text-[#5d4e37] font-inter">Loading users...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white border-2 border-[#d4c4b0] p-12 text-center">
          <p className="text-[#5d4e37] font-inter">No users found</p>
        </div>
      ) : (
        <>
          <div className="bg-white border-2 border-[#d4c4b0] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#f5f0e8]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-inter font-semibold text-[#2c2419]">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-inter font-semibold text-[#2c2419]">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-inter font-semibold text-[#2c2419]">Plan</th>
                  <th className="px-6 py-4 text-left text-sm font-inter font-semibold text-[#2c2419]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-inter font-semibold text-[#2c2419]">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4c4b0]">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    className="hover:bg-[#f5f0e8] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-inter text-[#2c2419]">{user.name}</td>
                    <td className="px-6 py-4 font-inter text-[#5d4e37]">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-inter font-semibold ${getPlanBadgeColor(user.plan)}`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-inter font-semibold capitalize ${getStatusBadgeColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-inter text-[#5d4e37]">{formatDate(user.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border-2 border-[#d4c4b0] font-inter text-[#2c2419] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f5f0e8] transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 font-inter text-[#2c2419]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border-2 border-[#d4c4b0] font-inter text-[#2c2419] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f5f0e8] transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
