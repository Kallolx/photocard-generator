"use client";

import { useState, useEffect } from "react";
import {
  Users,
  CreditCard,
  Search,
  CheckCircle,
  XCircle,
  Key,
  Shield,
  Activity,
  MoreVertical,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { adminAPI } from "@/lib/api";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface User {
  id: number;
  name: string;
  email: string;
  plan: "Free" | "Basic" | "Premium";
  status: "active" | "inactive" | "suspended";
  role: "user" | "admin";
  created_at: string;
  daily_limit: number;
  cards_generated_today: number;
  total_cards_generated: number;
  has_api_key?: boolean;
}

interface UserDetail extends User {
  api_key?: string;
  api_key_status?: string;
  api_key_created_at?: string;
  api_usage_today?: number;
  recentCards?: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    free: 0,
    basic: 0,
    premium: 0,
    totalCards: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });

  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchUsers(1);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      if (response.success) {
        setStats({
          totalUsers: response.data.totalUsers,
          free: response.data.planStats.free || 0,
          basic: response.data.planStats.basic || 0,
          premium: response.data.planStats.premium || 0,
          totalCards: response.data.totalCards,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchUsers = async (page: number) => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers({
        page,
        limit: 10,
        search: searchTerm,
      });
      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleUserClick = async (userId: number) => {
    setDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const response = await adminAPI.getUser(userId.toString());
      if (response.success) {
        setSelectedUser(response.data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      toast.error("Failed to fetch user details");
      setIsDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] font-inter text-[#2c2419] p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-lora font-bold text-[#2c2419]">
              Admin Dashboard
            </h1>
            <p className="text-[#5d4e37] mt-1">
              Manage users, plans, and system status.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchStats();
                fetchUsers(pagination.page);
              }}
              className="px-4 py-2 border-2 border-[#d4c4b0] text-[#5d4e37] font-semibold hover:border-[#8b6834] hover:text-[#2c2419] transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <div className="px-4 py-2 bg-[#d4c4b0] text-[#2c2419] font-bold font-lora">
              ADMIN MODE
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 border-2 border-[#d4c4b0] shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-[#5d4e37] font-medium uppercase tracking-wide">
                  Total Users
                </p>
                <h3 className="text-3xl font-lora font-bold mt-1">
                  {stats.totalUsers}
                </h3>
              </div>
              <div className="p-3 bg-[#f5f0e8] text-[#8b6834] rounded-full">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="w-full bg-[#f5f0e8] h-1.5 mt-2 rounded-full overflow-hidden flex">
              <div
                className="bg-[#8b6834] h-full"
                style={{
                  width: `${(stats.basic / stats.totalUsers) * 100}%`,
                }}
              ></div>
              <div
                className="bg-[#c2a178] h-full"
                style={{
                  width: `${(stats.premium / stats.totalUsers) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-6 border-2 border-[#d4c4b0] shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-[#5d4e37] font-medium uppercase tracking-wide">
                  Premium Users
                </p>
                <h3 className="text-3xl font-lora font-bold mt-1">
                  {stats.premium}
                </h3>
              </div>
              <div className="p-3 bg-[#f5f0e8] text-[#8b6834] rounded-full">
                <Shield className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-[#5d4e37]">
              {((stats.premium / stats.totalUsers) * 100).toFixed(1)}% of total
              base
            </p>
          </div>

          <div className="bg-white p-6 border-2 border-[#d4c4b0] shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-[#5d4e37] font-medium uppercase tracking-wide">
                  Cards Generated
                </p>
                <h3 className="text-3xl font-lora font-bold mt-1">
                  {stats.totalCards}
                </h3>
              </div>
              <div className="p-3 bg-[#f5f0e8] text-[#8b6834] rounded-full">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border-2 border-[#d4c4b0] shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-[#5d4e37] font-medium uppercase tracking-wide">
                  Active Plans
                </p>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Free:</span>
                    <span className="font-bold">{stats.free}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Basic:</span>
                    <span className="font-bold">{stats.basic}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-[#f5f0e8] text-[#8b6834] rounded-full">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white border-2 border-[#d4c4b0] shadow-sm overflow-hidden">
          <div className="p-6 border-b-2 border-[#f5f0e8] flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h2 className="text-xl font-lora font-bold">User Management</h2>
            <form onSubmit={handleSearch} className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-[#d4c4b0] focus:outline-none focus:border-[#8b6834] transition-colors"
              />
              <Search className="w-5 h-5 text-[#a08d74] absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#d4c4b0] border-t-[#8b6834]"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f5f0e8] text-[#5d4e37] text-xs uppercase font-bold tracking-wider text-left">
                  <tr>
                    <th className="px-6 py-4">User Info</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Credits</th>
                    <th className="px-6 py-4">API Key</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f0e8]">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-[#faf8f5] transition-colors cursor-pointer"
                      onClick={() => handleUserClick(user.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#d4c4b0] text-[#2c2419] flex items-center justify-center font-bold text-lg font-lora">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[#2c2419]">
                              {user.name}
                            </p>
                            <p className="text-sm text-[#8b6834] truncate max-w-[150px]">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-bold border-2 inline-flex items-center gap-1
                          ${
                            user.plan === "Premium"
                              ? "bg-[#2c2419] text-[#d4c4b0] border-[#2c2419]"
                              : user.plan === "Basic"
                                ? "bg-[#8b6834] text-white border-[#8b6834]"
                                : "bg-transparent text-[#5d4e37] border-[#d4c4b0]"
                          }`}
                        >
                          {user.plan === "Premium" && (
                            <Shield className="w-3 h-3" />
                          )}
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p>
                            <span className="font-bold">
                              {user.cards_generated_today}
                            </span>
                            <span className="text-[#a08d74]">
                              {" "}
                              /{" "}
                              {user.daily_limit === -1 ? "∞" : user.daily_limit}
                            </span>
                          </p>
                          <p className="text-xs text-[#a08d74]">Daily Limit</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.has_api_key ? (
                          <div className="flex items-center gap-1.5 text-green-700 font-medium text-sm">
                            <Key className="w-4 h-4" />
                            <span>Active</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.status === "active" ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-medium text-sm">
                            <div className="w-2 h-2 rounded-full bg-green-600"></div>
                            Active
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-600 font-medium text-sm">
                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            {user.status}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-[#d4c4b0]/20 rounded-full transition-colors text-[#5d4e37]">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="p-4 border-t-2 border-[#f5f0e8] flex items-center justify-between">
            <button
              disabled={pagination.page === 1}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="px-4 py-2 text-sm font-medium text-[#5d4e37] hover:text-[#2c2419] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-[#5d4e37]">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="px-4 py-2 text-sm font-medium text-[#5d4e37] hover:text-[#2c2419] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* User Detail Slide-over / Modal */}
      {isDetailOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end"
          onClick={() => setIsDetailOpen(false)}
        >
          <div
            className="w-full max-w-md h-full bg-white shadow-2xl p-6 overflow-y-auto border-l-4 border-[#8b6834]"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "slideIn 0.3s ease-out" }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-lora font-bold text-[#2c2419]">
                User Profile
              </h2>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-[#5d4e37] hover:text-[#2c2419] p-2"
              >
                <XCircle className="w-8 h-8" />
              </button>
            </div>

            {detailLoading || !selectedUser ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#d4c4b0] border-t-[#8b6834]"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Profile Header */}
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-[#d4c4b0] text-[#2c2419] flex items-center justify-center font-bold text-4xl font-lora mx-auto mb-4 border-4 border-white shadow-lg">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <p className="text-[#8b6834]">{selectedUser.email}</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <span className="px-4 py-1.5 bg-[#f5f0e8] text-[#5d4e37] text-xs font-bold uppercase tracking-wider rounded-full border border-[#d4c4b0]">
                      {selectedUser.plan} Plan
                    </span>
                    <span
                      className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border flex items-center gap-1 ${
                        selectedUser.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {selectedUser.status === "active" && (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      {selectedUser.status}
                    </span>
                  </div>
                </div>

                {/* API Key Section */}
                <div className="bg-[#fcfbf9] border border-[#d4c4b0] p-6 rounded-lg">
                  <h4 className="font-lora font-bold text-lg mb-4 flex items-center gap-2">
                    <Key className="w-5 h-5 text-[#8b6834]" /> API Access
                  </h4>
                  {selectedUser.api_key ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-[#5d4e37] uppercase font-bold tracking-wider block mb-1">
                          API Key
                        </label>
                        <div
                          className="bg-white border border-[#e5e5e5] p-3 text-sm font-mono text-[#5d4e37] break-all cursor-pointer hover:border-[#8b6834] transition-colors relative group"
                          onClick={() => copyToClipboard(selectedUser.api_key!)}
                        >
                          {selectedUser.api_key}
                          <div className="absolute top-0 right-0 h-full px-2 bg-[#f5f0e8] text-[#8b6834] text-xs font-bold flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            COPY
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#a08d74]">Status:</span>
                        <span className="font-medium text-green-700">
                          Active
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#a08d74]">Created:</span>
                        <span>
                          {new Date(
                            selectedUser.api_key_created_at || "",
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-[#a08d74]">
                      <p>No API Key generated for this user.</p>
                      {selectedUser.plan === "Premium" && (
                        <p className="text-xs mt-1">
                          (They can generate one in their settings)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Usage Stats */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-[#a08d74] border-b border-[#d4c4b0] pb-2">
                    Usage Statistics
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 border border-[#d4c4b0] bg-white text-center">
                      <p className="text-2xl font-bold text-[#8b6834] font-lora">
                        {selectedUser.cards_generated_today}
                      </p>
                      <p className="text-[10px] text-[#2c2419] uppercase font-bold tracking-widest mt-1">
                        Web Today
                      </p>
                    </div>
                    <div className="p-3 border border-[#d4c4b0] bg-white text-center">
                      <p className="text-2xl font-bold text-[#4a7c59] font-lora">
                        {selectedUser.api_usage_today || 0}
                      </p>
                      <p className="text-[10px] text-[#2c2419] uppercase font-bold tracking-widest mt-1">
                        API Today
                      </p>
                    </div>
                    <div className="p-3 border border-[#d4c4b0] bg-white text-center">
                      <p className="text-2xl font-bold text-[#2c2419] font-lora">
                        {selectedUser.total_cards_generated}
                      </p>
                      <p className="text-[10px] text-[#2c2419] uppercase font-bold tracking-widest mt-1">
                        Lifetime
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="pt-6 border-t border-[#e5e5e5] space-y-2 text-sm text-[#5d4e37]">
                  <div className="flex justify-between">
                    <span>Member Since:</span>
                    <span>
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Limit Reset:</span>
                    <span>{new Date().toLocaleTimeString()} (Simulated)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
