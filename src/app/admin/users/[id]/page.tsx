"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  CreditCard,
  Calendar,
  Key,
  Shield,
  CheckCircle,
  XCircle,
  Copy,
  RefreshCw,
} from "lucide-react";
import { adminAPI } from "@/lib/api";
import { toast } from "react-hot-toast";

interface UserDetails {
  id: number;
  name: string;
  email: string;
  plan: "Free" | "Basic" | "Premium";
  status: "active" | "inactive" | "suspended" | "deleted";
  created_at: string;
  daily_limit: number;
  cards_generated_today: number;
  total_cards_generated: number;
  batch_processing_enabled: boolean;
  custom_cards_enabled: boolean;
  api_access_enabled: boolean;
  api_key?: string;
  api_key_status?: string;
  api_key_created_at?: string;
  api_usage_today?: number;
  recentCards?: RecentCard[];
}

interface RecentCard {
  id: number;
  theme: string;
  created_at: string;
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [recentCards, setRecentCards] = useState<RecentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const response = await adminAPI.getUser(id);
      if (response.success) {
        setUser(response.data.user);
        setRecentCards(response.data.recentCards || []);
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (newPlan: "Free" | "Basic" | "Premium") => {
    if (!user || updating) return;

    setUpdating(true);
    try {
      const response = await adminAPI.updateUserPlan(id, newPlan);
      if (response.success) {
        setUser({ ...user, plan: newPlan });
        toast.success(`Plan updated to ${newPlan}`);
        fetchUserDetails(); // Refresh to get updated limits/flags
      }
    } catch (error) {
      console.error("Failed to update plan:", error);
      toast.error("Failed to update plan");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (
    newStatus: "active" | "inactive" | "suspended" | "deleted",
  ) => {
    if (!user || updating) return;

    setUpdating(true);
    try {
      const response = await adminAPI.updateUserStatus(id, newStatus);
      if (response.success) {
        setUser({ ...user, status: newStatus });
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const copyApiKey = () => {
    if (user?.api_key) {
      navigator.clipboard.writeText(user.api_key);
      toast.success("API Key copied to clipboard");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#faf8f5]">
        <div className="w-12 h-12 border-2 border-[#d4c4b0] border-t-[#8b6834] animate-spin rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 min-h-screen bg-[#faf8f5] flex items-center justify-center">
          <div className="bg-white border border-[#d4c4b0]/60 p-16 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#a08d74] mb-8">
            Access credentials not found in registry
          </p>
          <button
            onClick={() => router.push("/admin")}
            className="px-8 py-3 bg-[#8b6834] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#2c2419] transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ... (warm boxed update for User Detail)
  return (
    <div className="min-h-screen bg-[#faf8f5] p-6 md:p-12 font-inter text-[#2c2419]">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/admin")}
            className="p-3 border border-[#d4c4b0]/60 hover:bg-[#8b6834] hover:text-[#faf8f5] hover:border-[#8b6834] transition-all bg-white active:scale-95 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#2c2419] uppercase tracking-tight">
              {user.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <span className="px-3 py-1 bg-[#f5f0e8]/50 text-[#8b6834] text-[9px] font-black uppercase tracking-widest border border-[#d4c4b0]/40">
                REGISTRY ID: {user.id}
              </span>
              <span className="text-[10px] font-bold text-[#5d4e37] uppercase tracking-wider">
                {user.email}
              </span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={fetchUserDetails}
              className="p-3 bg-white border border-[#d4c4b0]/40 text-[#5d4e37] hover:text-[#8b6834] hover:border-[#8b6834]/40 transition-all active:rotate-180"
              title="Sync Account Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: User Info & API Key */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white border border-[#d4c4b0]/60 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                <User className="w-48 h-48 text-[#8b6834]" />
              </div>

              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#2c2419] mb-8 border-b border-[#f5f0e8] pb-4 flex items-center gap-2 relative z-10">
                <User className="w-4 h-4 text-[#8b6834]" />
                Identity & Access Metadata
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#a08d74] mb-2">
                    Current Registry State
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest border transition-all ${
                      user.status === "active"
                        ? "bg-green-50/50 text-green-700 border-green-200"
                        : "bg-red-50/50 text-red-700 border-red-200"
                    }`}
                  >
                    {user.status === "active" && (
                      <CheckCircle className="w-3 h-3" />
                    )}
                    {user.status === "active"
                      ? "OPERATIONAL"
                      : user.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#a08d74] mb-2">
                    Active Provisioning
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest border transition-all ${
                      user.plan === "Premium"
                        ? "bg-[#2c2419] text-[#faf8f5] border-[#2c2419]"
                        : user.plan === "Basic"
                          ? "bg-[#8b6834] text-white border-[#8b6834]"
                          : "bg-gray-100/50 text-gray-500 border-gray-200"
                    }`}
                  >
                    {user.plan === "Premium" && <Shield className="w-3 h-3" />}
                    {user.plan} PLAN
                  </span>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs font-bold uppercase text-[#a08d74] mb-1">
                    Joined Date
                  </p>
                  <p className="text-lg font-medium text-[#2c2419]">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* API Key Section - Enhanced */}
            <div className="bg-white border border-[#d4c4b0]/60 p-8">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#2c2419] mb-6 border-b border-[#f5f0e8] pb-4 flex items-center gap-2">
                <Key className="w-4 h-4 text-[#8b6834]" />
                API Protocols & Authorization
              </h3>

              {user.api_key ? (
                <div className="bg-[#faf8f5] border border-[#d4c4b0]/40 p-6 relative">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#4a7c59]/10 text-[#4a7c59] text-[9px] font-black uppercase mb-2 border border-[#4a7c59]/20">
                        <CheckCircle className="w-2.5 h-2.5" /> SECURE KEY
                        VERIFIED
                      </span>
                      <p className="text-[10px] font-bold text-[#a08d74] uppercase tracking-tight">
                        GENERATED:{" "}
                        {user.api_key_created_at
                          ? new Date(
                              user.api_key_created_at,
                            ).toLocaleDateString()
                          : "NULL"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-[#5d4e37] tracking-widest">
                      Encrypted Key Details
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <code className="bg-white border border-[#d4c4b0]/30 p-4 font-bold text-[11px] text-[#2c2419] flex-grow break-all select-all border-dashed">
                        {user.api_key}
                      </code>
                      <button
                        onClick={copyApiKey}
                        className="bg-[#2c2419] text-white px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-[#8b6834] transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Copy className="w-3.5 h-3.5" /> COPY
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-300 p-8 text-center rounded">
                  <Key className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">
                    No active API Key found
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    This user hasn't generated an API key yet.
                  </p>
                  {user.plan === "Premium" && (
                    <div className="mt-4 text-xs bg-blue-50 text-blue-700 px-3 py-1 inline-block rounded">
                      User is on Premium plan and eligible to generate one.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-[#d4c4b0]/60 p-8">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#2c2419] mb-8 border-b border-[#f5f0e8] pb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8b6834]" />
                Recent Generation Logs ({recentCards.length})
              </h3>

              {recentCards.length > 0 ? (
                <div className="overflow-hidden border border-[#d4c4b0]/40">
                  <table className="w-full text-left">
                    <thead className="bg-[#f5f0e8]/50 text-[#5d4e37] font-black uppercase text-[10px] tracking-widest">
                      <tr>
                        <th className="px-5 py-4 border-b border-[#d4c4b0]/20">
                          Trace ID
                        </th>
                        <th className="px-5 py-4 border-b border-[#d4c4b0]/20">
                          Template
                        </th>
                        <th className="px-5 py-4 border-b border-[#d4c4b0]/20">
                          Execution Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f0e8]">
                      {recentCards.map((card) => (
                        <tr
                          key={card.id}
                          className="bg-white hover:bg-[#faf8f5] transition-colors"
                        >
                          <td className="px-5 py-4 text-[10px] font-black text-[#8b6834] uppercase tracking-tight">
                            #{card.id}
                          </td>
                          <td className="px-5 py-4 text-[11px] font-bold uppercase tracking-tight text-[#2c2419]">
                            {card.theme}
                          </td>
                          <td className="px-5 py-4 text-[10px] font-bold text-[#5d4e37] uppercase tracking-tight">
                            {formatDate(card.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-[#a08d74] italic">
                  No card generation history available.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Actions & Limits */}
          <div className="space-y-10">
            {/* Quick Actions Panel */}
            <div className="bg-[#2c2419] text-[#faf8f5] p-8 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 opacity-10">
                <Shield className="w-48 h-48" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-widest mb-8 border-b border-[#faf8f5]/20 pb-4">
                Administrative Overrides
              </h3>

              <div className="space-y-6 relative z-10">
                <div>
                  <label className="text-[9px] font-black uppercase text-[#d4c4b0] mb-3 block tracking-widest">
                    Provision Account Level
                  </label>
                  <div className="space-y-2">
                    {(["Free", "Basic", "Premium"] as const).map((plan) => (
                      <button
                        key={plan}
                        onClick={() => handlePlanChange(plan)}
                        disabled={user.plan === plan || updating}
                        className={`w-full px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-left transition-all flex items-center justify-between border ${
                          user.plan === plan
                            ? "bg-[#faf8f5] text-[#2c2419] border-[#faf8f5]"
                            : "bg-transparent text-[#d4c4b0] border-[#d4c4b0]/40 hover:bg-[#faf8f5]/10 hover:border-[#faf8f5]/30"
                        }`}
                      >
                        {plan}
                        {user.plan === plan && (
                          <div className="h-1.5 w-1.5 bg-[#8b6834]"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-[#faf8f5]/10">
                  <label className="text-[9px] font-black uppercase text-[#d4c4b0] mb-3 block tracking-widest">
                    Registry Security Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["active", "inactive", "suspended"] as const).map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          disabled={user.status === status || updating}
                          className={`w-full px-2 py-2 text-[10px] font-bold text-center uppercase tracking-widest transition-all border ${
                            user.status === status
                              ? status === "active"
                                ? "bg-[#4a7c59] text-white border-[#4a7c59]"
                                : "bg-red-600 text-white border-red-600"
                              : "bg-transparent text-[#d4c4b0] border-[#d4c4b0]/30 hover:bg-[#faf8f5]/10"
                          }`}
                        >
                          {status}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Limits & Usage Card */}
            <div className="bg-white border border-[#d4c4b0]/60 p-8">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#2c2419] mb-8 border-b border-[#f5f0e8] pb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#8b6834]" />
                Resource Utilization
              </h3>

              <div className="space-y-4">
                <div className="bg-[#faf8f5] p-5 border border-[#d4c4b0]/40">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[9px] font-black uppercase text-[#a08d74] tracking-widest">
                      WEB GENERATION LOAD
                    </span>
                    <span className="text-2xl font-black text-[#2c2419] tracking-tight leading-none">
                      {user.cards_generated_today}
                      <span className="text-[10px] text-[#a08d74] font-bold mx-2 opacity-50">
                        OF
                      </span>
                      {user.daily_limit === -1 ? "∞" : user.daily_limit}
                    </span>
                  </div>
                  {user.daily_limit !== -1 && (
                    <div className="w-full bg-[#f5f0e8] h-1.5 border border-[#d4c4b0]/30 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${
                          user.cards_generated_today >= user.daily_limit
                            ? "bg-red-600"
                            : "bg-[#8b6834]"
                        }`}
                        style={{
                          width: `${Math.min(
                            (user.cards_generated_today / user.daily_limit) *
                              100,
                            100,
                          )}%`,
                        }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* API Usage Block */}
                <div className="bg-[#faf8f5] p-5 border border-[#d4c4b0]/40">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black uppercase text-[#a08d74] tracking-widest">
                      API REQUEST VOLUME / 24H
                    </span>
                    <span className="text-2xl font-black text-[#2c2419] tracking-tight leading-none">
                      {user.api_usage_today || 0}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-[#d4c4b0]/40 text-center">
                    <p className="text-[8px] font-black uppercase text-[#a08d74] mb-2 tracking-widest">
                      TOTAL ASSETS
                    </p>
                    <p className="text-xl font-black text-[#2c2419] tracking-tight">
                      {user.total_cards_generated}
                    </p>
                  </div>
                  <div className="p-4 bg-white border border-[#d4c4b0]/40 text-center">
                    <p className="text-[8px] font-black uppercase text-[#a08d74] mb-2 tracking-widest">
                      BATCH ENGINE
                    </p>
                    <p
                      className={`text-[10px] font-black uppercase tracking-widest ${
                        user.batch_processing_enabled
                          ? "text-[#4a7c59] bg-[#4a7c59]/10 py-1"
                          : "text-[#a08d74] opacity-50"
                      }`}
                    >
                      {user.batch_processing_enabled ? "ENABLED" : "DISABLED"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
