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
            <h1 className="text-2xl md:text-3xl font-black text-[#2c2419] uppercase tracking-tight">
              Admin Overview
            </h1>
            <p className="text-[11px] font-bold text-[#5d4e37] mt-1 uppercase tracking-widest opacity-70">
              System monitoring & user administration
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchStats();
                fetchUsers(pagination.page);
              }}
              className="px-4 py-2 border border-[#d4c4b0] text-[10px] font-black uppercase tracking-widest text-[#5d4e37] hover:border-[#8b6834] hover:text-[#2c2419] transition-all flex items-center gap-2 bg-white active:translate-x-[1px] active:translate-y-[1px]"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <div className="px-4 py-2 bg-[#2c2419] text-[#faf8f5] text-[10px] font-black uppercase tracking-widest border border-[#2c2419] shadow-[2px_2px_0px_0px_#8b6834]">
              ADMIN MODE
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 border border-[#d4c4b0]/60 shadow-[4px_4px_0px_0px_rgba(44,36,25,0.05)]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] text-[#8b6834] font-black uppercase tracking-widest">
                  Total Users
                </p>
                <h3 className="text-3xl font-black mt-1 text-[#2c2419] tracking-tight">
                  {stats.totalUsers}
                </h3>
              </div>
              <div className="p-2.5 bg-[#f5f0e8]/50 text-[#8b6834] border border-[#d4c4b0]/40">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="w-full bg-[#f5f0e8] h-1 mt-4 rounded-none overflow-hidden flex">
              <div
                className="bg-[#8b6834] h-full"
                style={{
                  width: `${(stats.basic / stats.totalUsers) * 100}%`,
                }}
              ></div>
              <div
                className="bg-[#2c2419] h-full"
                style={{
                  width: `${(stats.premium / stats.totalUsers) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-6 border border-[#d4c4b0]/60 shadow-[4px_4px_0px_0px_rgba(44,36,25,0.05)]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] text-[#8b6834] font-black uppercase tracking-widest">
                  Premium Users
                </p>
                <h3 className="text-3xl font-black mt-1 text-[#2c2419] tracking-tight">
                  {stats.premium}
                </h3>
              </div>
              <div className="p-2.5 bg-[#f5f0e8]/50 text-[#8b6834] border border-[#d4c4b0]/40">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-[#5d4e37] uppercase tracking-tight mt-1">
              {((stats.premium / stats.totalUsers) * 100).toFixed(1)}%
              Conversion rate
            </p>
          </div>

          <div className="bg-white p-6 border border-[#d4c4b0]/60 shadow-[4px_4px_0px_0px_rgba(44,36,25,0.05)]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] text-[#8b6834] font-black uppercase tracking-widest">
                  Cards Generated
                </p>
                <h3 className="text-3xl font-black mt-1 text-[#2c2419] tracking-tight">
                  {stats.totalCards}
                </h3>
              </div>
              <div className="p-2.5 bg-[#f5f0e8]/50 text-[#8b6834] border border-[#d4c4b0]/40">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border border-[#d4c4b0]/60 shadow-[4px_4px_0px_0px_rgba(44,36,25,0.05)]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] text-[#8b6834] font-black uppercase tracking-widest">
                  Plan Distribution
                </p>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-[11px] font-bold uppercase text-[#2c2419]">
                    <span>Basic:</span>
                    <span>{stats.basic}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold uppercase text-[#8b6834]">
                    <span>Free:</span>
                    <span>{stats.free}</span>
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-[#f5f0e8]/50 text-[#8b6834] border border-[#d4c4b0]/40">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white border border-[#d4c4b0]/60 shadow-[8px_8px_0px_0px_rgba(44,36,25,0.05)] overflow-hidden">
          <div className="p-6 border-b border-[#f5f0e8] flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#2c2419]">
              User Management
            </h2>
            <form onSubmit={handleSearch} className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="SEARCH HEADLINES OR EMAILS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#f5f0e8]/50 border border-[#d4c4b0]/40 rounded-none text-[10px] font-black uppercase tracking-widest focus:outline-none focus:bg-white focus:border-[#8b6834]/40 transition-all placeholder:opacity-50"
              />
              <Search className="w-4 h-4 text-[#a08d74] absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#d4c4b0] border-t-[#8b6834]"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f5f0e8]/50 text-[#5d4e37] text-[10px] uppercase font-black tracking-widest text-left">
                  <tr>
                    <th className="px-6 py-4 border-b border-[#d4c4b0]/40">
                      User Profile
                    </th>
                    <th className="px-6 py-4 border-b border-[#d4c4b0]/40">
                      Account Plan
                    </th>
                    <th className="px-6 py-4 border-b border-[#d4c4b0]/40">
                      Usage Credits
                    </th>
                    <th className="px-6 py-4 border-b border-[#d4c4b0]/40">
                      API Status
                    </th>
                    <th className="px-6 py-4 border-b border-[#d4c4b0]/40">
                      System Status
                    </th>
                    <th className="px-6 py-4 border-b border-[#d4c4b0]/40 text-right">
                      Actions
                    </th>
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
                          <div className="w-9 h-9 border border-[#d4c4b0]/60 bg-[#e8dcc8] text-[#8b6834] flex items-center justify-center font-bold text-base shadow-none">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[13px] font-black uppercase tracking-tight text-[#2c2419]">
                              {user.name}
                            </p>
                            <p className="text-[10px] font-bold text-[#8b6834]/80 truncate max-w-[150px] uppercase tracking-wider">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border inline-flex items-center gap-1.5
                          ${
                            user.plan === "Premium"
                              ? "bg-[#2c2419] text-[#faf8f5] border-[#2c2419]"
                              : user.plan === "Basic"
                                ? "bg-[#8b6834] text-white border-[#8b6834]"
                                : "bg-[#f5f0e8] text-[#5d4e37] border-[#d4c4b0]/60"
                          }`}
                        >
                          {user.plan === "Premium" && (
                            <Shield className="w-3 h-3" />
                          )}
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[11px] font-bold uppercase tracking-tight">
                          <p>
                            <span className="text-[#2c2419]">
                              {user.cards_generated_today}
                            </span>
                            <span className="text-[#a08d74] opacity-50">
                              {" "}
                              /{" "}
                              {user.daily_limit === -1 ? "∞" : user.daily_limit}
                            </span>
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.has_api_key ? (
                          <div className="flex items-center gap-1.5 text-green-700 font-black text-[10px] uppercase tracking-widest">
                            <CheckCircle className="w-3 h-3" />
                            <span>Active</span>
                          </div>
                        ) : (
                          <span className="text-[#a08d74]/50 text-[10px] font-black uppercase tracking-widest">
                            Disconnected
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.status === "active" ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-black text-[10px] uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 bg-green-600"></span>
                            Online
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-600 font-black text-[10px] uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 bg-red-600"></span>
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
          <div className="p-4 border-t border-[#f5f0e8] bg-[#faf8f5]/50 flex items-center justify-between">
            <button
              disabled={pagination.page === 1}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#5d4e37] hover:text-[#2c2419] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8b6834]">
              Page {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#5d4e37] hover:text-[#2c2419] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
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
            className="w-full max-w-md h-full bg-[#faf8f5] shadow-[-20px_0_50px_rgba(44,36,25,0.1)] p-8 overflow-y-auto border-l border-[#d4c4b0]/40"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-sm font-black uppercase tracking-widest text-[#2c2419]">
                User Profile
              </h2>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-[#5d4e37] hover:text-[#2c2419] p-2 bg-[#f5f0e8]/50 border border-[#d4c4b0]/40 transition-all active:scale-95"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {detailLoading || !selectedUser ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-2 border-[#d4c4b0] border-t-[#8b6834] animate-spin rounded-full"></div>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Profile Header */}
                <div className="text-center">
                  <div className="w-24 h-24 border-2 border-[#d4c4b0]/40 bg-[#e8dcc8] text-[#8b6834] flex items-center justify-center font-black text-4xl mx-auto mb-6 shadow-[8px_8px_0px_0px_rgba(139,104,52,0.1)]">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#2c2419]">
                    {selectedUser.name}
                  </h3>
                  <p className="text-[11px] font-bold text-[#8b6834] uppercase tracking-widest mt-1 opacity-80">
                    {selectedUser.email}
                  </p>
                  <div className="mt-6 flex justify-center gap-3">
                    <span className="px-3 py-1.5 bg-[#f5f0e8]/50 text-[#5d4e37] text-[9px] font-black uppercase tracking-widest border border-[#d4c4b0]/60">
                      {selectedUser.plan} Plan
                    </span>
                    <span
                      className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${
                        selectedUser.status === "active"
                          ? "bg-green-50/50 text-green-700 border-green-200"
                          : "bg-red-50/50 text-red-700 border-red-200"
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
                <div className="bg-[#faf8f5] border border-[#d4c4b0]/60 p-6 shadow-[4px_4px_0px_0px_rgba(44,36,25,0.05)]">
                  <h4 className="text-[10px] font-black underline decoration-[#8b6834] uppercase tracking-widest text-[#2c2419] mb-5 flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-[#8b6834]" /> API ACCESS
                    STATUS
                  </h4>
                  {selectedUser.api_key ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] text-[#a08d74] uppercase font-black tracking-widest block mb-2">
                          Encrypted Key
                        </label>
                        <div
                          className="bg-white border border-[#d4c4b0]/40 p-3 text-[10px] font-bold text-[#2c2419] break-all border-dashed cursor-pointer hover:border-[#8b6834] transition-all relative group"
                          onClick={() => copyToClipboard(selectedUser.api_key!)}
                        >
                          {selectedUser.api_key}
                          <div className="absolute top-0 right-0 h-full px-2 bg-[#8b6834] text-white text-[8px] font-black uppercase flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            COPY
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                        <span className="text-[#a08d74]">Auth Status</span>
                        <span className="text-green-700 bg-green-50 px-2 py-0.5">
                          VERIFIED
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                        <span className="text-[#a08d74]">Activation Date</span>
                        <span className="text-[#2c2419]">
                          {new Date(
                            selectedUser.api_key_created_at || "",
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-[10px] font-bold uppercase tracking-widest text-[#a08d74]/60">
                      <p>No API Credentials Provisioned</p>
                    </div>
                  )}
                </div>

                {/* Usage Stats */}
                <div className="space-y-5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#a08d74] opacity-50 border-b border-[#d4c4b0]/30 pb-2">
                    System Usage Profile
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 border border-[#d4c4b0]/40 bg-white">
                      <p className="text-xl font-black text-[#8b6834] tracking-tight">
                        {selectedUser.cards_generated_today}
                      </p>
                      <p className="text-[8px] text-[#2c2419] uppercase font-bold tracking-widest mt-2">
                        WEB-CARD / 24H
                      </p>
                    </div>
                    <div className="p-4 border border-[#d4c4b0]/40 bg-white">
                      <p className="text-xl font-black text-[#2c2419] tracking-tight">
                        {selectedUser.api_usage_today || 0}
                      </p>
                      <p className="text-[8px] text-[#2c2419] uppercase font-bold tracking-widest mt-2">
                        API-CALL / 24H
                      </p>
                    </div>
                    <div className="p-4 border border-[#d4c4b0]/40 bg-white">
                      <p className="text-xl font-black text-[#2c2419] tracking-tight">
                        {selectedUser.total_cards_generated}
                      </p>
                      <p className="text-[8px] text-[#2c2419] uppercase font-bold tracking-widest mt-2">
                        LIFETIME GEN
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="pt-6 border-t border-[#f5f0e8] space-y-3 text-[10px] font-bold uppercase tracking-tight text-[#5d4e37]/70">
                  <div className="flex justify-between">
                    <span>Account Creation Date</span>
                    <span className="text-[#2c2419]">
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>System Sync Timestamp</span>
                    <span className="text-[#2c2419]">
                      {new Date().toLocaleTimeString()}
                    </span>
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
