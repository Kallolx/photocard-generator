"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { adminAPI } from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  plan: "Free" | "Basic" | "Premium";
  status: "active" | "inactive";
  created_at: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<
    "all" | "Free" | "Basic" | "Premium"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
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
      if (planFilter !== "all") params.plan = planFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await adminAPI.getUsers(params);
      if (response.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "premium":
        return "bg-[#8b6834] text-white";
      case "basic":
        return "bg-[#d4c4b0] text-[#2c2419]";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "active"
      ? "bg-[#4a7c59] text-white"
      : "bg-gray-300 text-gray-600";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 md:p-12 bg-[#faf8f5] min-h-full">
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-black text-[#2c2419] uppercase tracking-tight">
          System Users
        </h2>
        <p className="text-[11px] font-bold text-[#5d4e37] mt-1 uppercase tracking-widest opacity-70">
          Query and manage authorized account access
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 items-center mb-8">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a08d74] w-4 h-4" />
          <input
            type="text"
            placeholder="FILTER BY CREDENTIALS OR NAME..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 bg-[#f5f0e8]/50 border border-[#d4c4b0]/40 text-[10px] font-black uppercase tracking-widest placeholder-[#a08d74]/50 focus:outline-none focus:bg-white focus:border-[#8b6834]/40 transition-all"
          />
        </div>

        <select
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value as typeof planFilter);
            setCurrentPage(1);
          }}
          className="px-6 py-3 border border-[#d4c4b0]/40 bg-white text-[10px] font-black uppercase tracking-widest text-[#2c2419] focus:outline-none focus:border-[#8b6834]/40 cursor-pointer transition-all"
        >
          <option value="all">PLANS: ALL</option>
          <option value="Free">PLAN: FREE</option>
          <option value="Basic">PLAN: BASIC</option>
          <option value="Premium">PLAN: PREMIUM</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as typeof statusFilter);
            setCurrentPage(1);
          }}
          className="px-6 py-3 border border-[#d4c4b0]/40 bg-white text-[10px] font-black uppercase tracking-widest text-[#2c2419] focus:outline-none focus:border-[#8b6834]/40 cursor-pointer transition-all"
        >
          <option value="all">STATUS: ALL</option>
          <option value="active">STATUS: ACTIVE</option>
          <option value="inactive">STATUS: INACTIVE</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-2 border-[#d4c4b0] border-t-[#8b6834] animate-spin rounded-full"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white border border-[#d4c4b0]/40 p-16 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#a08d74]/50">
            No matching search records found
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-[#d4c4b0]/60 overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#f5f0e8]/50 text-[#5d4e37] text-[10px] uppercase font-black tracking-widest text-left">
                <tr>
                  <th className="px-6 py-5 border-b border-[#d4c4b0]/40">
                    Verified Identity
                  </th>
                  <th className="px-6 py-5 border-b border-[#d4c4b0]/40">
                    Electronic Mail
                  </th>
                  <th className="px-6 py-5 border-b border-[#d4c4b0]/40">
                    Active Subscription
                  </th>
                  <th className="px-6 py-5 border-b border-[#d4c4b0]/40">
                    Current Status
                  </th>
                  <th className="px-6 py-5 border-b border-[#d4c4b0]/40 text-right">
                    Registry Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4c4b0]">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    className="hover:bg-[#f5f0e8] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-[#d4c4b0]/60 bg-[#e8dcc8] text-[#8b6834] flex items-center justify-center font-black text-xs shadow-none">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[13px] font-black uppercase tracking-tight text-[#2c2419]">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[10px] font-bold text-[#8b6834] uppercase tracking-wider">
                      {user.email}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest border transition-colors ${
                          user.plan === "Premium"
                            ? "bg-[#2c2419] text-[#faf8f5] border-[#2c2419]"
                            : user.plan === "Basic"
                              ? "bg-[#8b6834] text-white border-[#8b6834]"
                              : "bg-[#f5f0e8] text-[#5d4e37] border-[#d4c4b0]/60"
                        }`}
                      >
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${
                          user.status === "active"
                            ? "text-green-600"
                            : "text-[#a08d74]/50"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 ${user.status === "active" ? "bg-green-600" : "bg-[#d4c4b0]"}`}
                        ></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right text-[10px] font-bold text-[#2c2419] uppercase tracking-tight">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-6 py-2 border border-[#d4c4b0]/60 bg-white text-[10px] font-black uppercase tracking-widest text-[#5d4e37] disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#f5f0e8] transition-all"
              >
                Previous
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8b6834]">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-6 py-2 border border-[#d4c4b0]/60 bg-white text-[10px] font-black uppercase tracking-widest text-[#5d4e37] disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#f5f0e8] transition-all"
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
