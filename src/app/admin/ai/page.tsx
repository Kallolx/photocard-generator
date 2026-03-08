"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bot,
  Search,
  RefreshCw,
  ShieldOff,
  ShieldCheck,
  TrendingUp,
  Users,
  Activity,
  BarChart2,
} from "lucide-react";
import { adminAPI } from "@/lib/api";
import { toast } from "react-hot-toast";

interface AIUserRow {
  id: number;
  name: string;
  email: string;
  plan: "Free" | "Basic" | "Premium";
  status: "active" | "inactive" | "suspended";
  ai_enabled: number; // 0 | 1
  ai_requests_today: number;
  ai_requests_total: number;
  ai_requests_last_reset: string | null;
  last_login: string | null;
}

interface Totals {
  total_today: number;
  grand_total: number;
  blocked_users: number;
}

const PLAN_COLORS: Record<string, string> = {
  Free: "bg-[#f5f0e8] text-[#8b6834] border-[#d4c4b0]",
  Basic: "bg-[#e8f4fd] text-[#2563eb] border-[#bfdbfe]",
  Premium: "bg-[#f5f0e8] text-[#7c3aed] border-[#ddd6fe]",
};

export default function AdminAIPage() {
  const [users, setUsers] = useState<AIUserRow[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    total: 0,
  });

  const fetch = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminAPI.getAIUsage({ page, limit: 20, search });
      if (res.success) {
        setUsers(res.data.users);
        setTotals(res.data.totals);
        setPagination({ ...res.data.pagination, limit: 20 });
      }
    } catch {
      toast.error("Failed to load AI usage data");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetch(1);
  }, [fetch]);

  const handleToggleAI = async (user: AIUserRow) => {
    const newState = !user.ai_enabled;
    setToggling(user.id);
    try {
      const res = await adminAPI.setUserAIEnabled(user.id, newState);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, ai_enabled: newState ? 1 : 0 } : u,
          ),
        );
        toast.success(`AI ${newState ? "enabled" : "disabled"} for ${user.name}`);
      } else {
        toast.error(res.message || "Failed to update");
      }
    } catch {
      toast.error("Request failed");
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 font-inter text-[#2c2419]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
            <Bot className="w-6 h-6 text-[#8b6834]" />
            AI Usage & Control
          </h1>
          <p className="text-[11px] font-bold text-[#5d4e37] mt-1 uppercase tracking-widest opacity-70">
            Monitor AI requests and enable / disable AI per user
          </p>
        </div>
        <button
          onClick={() => fetch(pagination.page)}
          className="px-4 py-2 border border-[#d4c4b0] text-[10px] font-black uppercase tracking-widest text-[#5d4e37] hover:border-[#8b6834] hover:text-[#2c2419] transition-all flex items-center gap-2 bg-white"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {totals && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#d4c4b0]/40 p-6 flex items-center gap-4">
            <div className="p-3 bg-[#f5f0e8] border border-[#d4c4b0]/40">
              <Activity className="w-5 h-5 text-[#8b6834]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#5d4e37] opacity-70">
                AI Requests Today
              </p>
              <p className="text-2xl font-black text-[#2c2419]">
                {totals.total_today ?? 0}
              </p>
            </div>
          </div>
          <div className="bg-white border border-[#d4c4b0]/40 p-6 flex items-center gap-4">
            <div className="p-3 bg-[#f5f0e8] border border-[#d4c4b0]/40">
              <BarChart2 className="w-5 h-5 text-[#8b6834]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#5d4e37] opacity-70">
                Total AI Requests (All Time)
              </p>
              <p className="text-2xl font-black text-[#2c2419]">
                {totals.grand_total ?? 0}
              </p>
            </div>
          </div>
          <div className="bg-white border border-[#d4c4b0]/40 p-6 flex items-center gap-4">
            <div className="p-3 bg-red-50 border border-red-100">
              <ShieldOff className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#5d4e37] opacity-70">
                Users with AI Blocked
              </p>
              <p className="text-2xl font-black text-red-600">
                {totals.blocked_users ?? 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b6834]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetch(1)}
            className="w-full pl-9 pr-4 py-2.5 border border-[#d4c4b0] bg-white text-sm focus:outline-none focus:border-[#8b6834] transition-colors"
          />
        </div>
        <button
          onClick={() => fetch(1)}
          className="px-5 py-2.5 bg-[#2c2419] text-white text-xs font-black uppercase tracking-widest hover:bg-[#8b6834] transition-colors"
        >
          Search
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#d4c4b0]/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f5f0e8] border-b border-[#d4c4b0]/40">
              <tr>
                {["User", "Plan", "AI Status", "Today", "Total (All-Time)", "Last Active", "Action"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-[#5d4e37] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4c4b0]/20">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-[#d4c4b0]/20 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[#5d4e37] text-sm font-medium opacity-60">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#2c2419]">{user.name}</p>
                      <p className="text-[11px] text-[#5d4e37] opacity-70">{user.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider border ${PLAN_COLORS[user.plan] || ""}`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {user.ai_enabled ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-700 uppercase tracking-wider">
                          <ShieldCheck className="w-3.5 h-3.5" /> Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-red-600 uppercase tracking-wider">
                          <ShieldOff className="w-3.5 h-3.5" /> Blocked
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold tabular-nums">
                      {user.ai_requests_today}
                    </td>
                    <td className="px-5 py-4 font-bold tabular-nums">
                      {user.ai_requests_total}
                    </td>
                    <td className="px-5 py-4 text-[#5d4e37] text-xs">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleAI(user)}
                        disabled={toggling === user.id}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ${
                          user.ai_enabled
                            ? "border-red-200 text-red-600 hover:bg-red-50 bg-white"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white"
                        }`}
                      >
                        {toggling === user.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : user.ai_enabled ? (
                          <><ShieldOff className="w-3 h-3" /> Block AI</>
                        ) : (
                          <><ShieldCheck className="w-3 h-3" /> Enable AI</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-[#d4c4b0]/40 bg-[#faf8f5]">
            <p className="text-xs text-[#5d4e37] font-medium">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetch(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 border border-[#d4c4b0] text-xs font-bold text-[#5d4e37] hover:border-[#8b6834] disabled:opacity-30 disabled:cursor-not-allowed bg-white"
              >
                Prev
              </button>
              <button
                onClick={() => fetch(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 border border-[#d4c4b0] text-xs font-bold text-[#5d4e37] hover:border-[#8b6834] disabled:opacity-30 disabled:cursor-not-allowed bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
