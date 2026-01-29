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
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#d4c4b0] border-t-[#8b6834]"></div>
          <p className="mt-4 text-[#5d4e37] font-inter">
            Loading user details...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="bg-white border-2 border-[#d4c4b0] p-12 text-center shadow-lg">
          <p className="text-[#5d4e37] font-inter mb-4 text-xl">
            User not found
          </p>
          <button
            onClick={() => router.push("/admin")}
            className="px-6 py-2 bg-[#8b6834] text-white font-inter hover:bg-[#6d5229] transition-colors font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ... (warm boxed update for User Detail)
  return (
    <div className="min-h-screen bg-[#faf8f5] p-6 md:p-12 font-inter text-[#2c2419]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin")}
            className="p-3 border border-[#d4c4b0] hover:bg-[#8b6834] hover:text-[#faf8f5] hover:border-[#8b6834] transition-colors bg-white shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-lora font-bold text-[#2c2419]">
              {user.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="px-3 py-0.5 bg-[#f5f0e8] text-[#5d4e37] text-xs font-bold uppercase tracking-wider rounded-full border border-[#d4c4b0]">
                ID: {user.id}
              </span>
              <span className="text-[#5d4e37]">{user.email}</span>
            </div>
          </div>
          <div className="ml-auto">
            <button
              onClick={fetchUserDetails}
              className="p-2 text-[#5d4e37] hover:text-[#8b6834] transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: User Info & API Key */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white border-2 border-[#d4c4b0] p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <User className="w-32 h-32 text-[#8b6834]" />
              </div>

              <h3 className="text-xl font-lora font-bold text-[#2c2419] mb-6 flex items-center gap-2 relative z-10">
                <User className="w-5 h-5 text-[#8b6834]" />
                User Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div>
                  <p className="text-xs font-bold uppercase text-[#a08d74] mb-1">
                    Current Status
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-full border ${
                      user.status === "active"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {user.status === "active" && (
                      <CheckCircle className="w-3 h-3" />
                    )}
                    {user.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-[#a08d74] mb-1">
                    Current Plan
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-full border ${
                      user.plan === "Premium"
                        ? "bg-[#2c2419] text-[#d4c4b0] border-[#2c2419]"
                        : user.plan === "Basic"
                          ? "bg-[#8b6834] text-white border-[#8b6834]"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {user.plan === "Premium" && <Shield className="w-3 h-3" />}
                    {user.plan}
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
            <div className="bg-white border-2 border-[#d4c4b0] p-8 shadow-sm">
              <h3 className="text-xl font-lora font-bold text-[#2c2419] mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-[#8b6834]" />
                API Access & Keys
              </h3>

              {user.api_key ? (
                <div className="bg-[#fcfbf9] border border-[#d4c4b0] p-6 rounded relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs font-bold uppercase mb-2">
                        <CheckCircle className="w-3 h-3" /> Active Key
                      </span>
                      <p className="text-xs text-[#a08d74]">
                        Created on{" "}
                        {user.api_key_created_at
                          ? new Date(
                              user.api_key_created_at,
                            ).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#5d4e37]">
                      API Key Details
                    </label>
                    <div className="flex gap-2">
                      <code className="bg-white border border-[#e5e5e5] p-3 rounded font-mono text-sm text-[#2c2419] flex-grow break-all select-all">
                        {user.api_key}
                      </code>
                      <button
                        onClick={copyApiKey}
                        className="bg-[#f5f0e8] border border-[#d4c4b0] text-[#8b6834] px-4 rounded hover:bg-[#ebdcc6] transition-colors font-medium flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" /> Copy
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
            <div className="bg-white border-2 border-[#d4c4b0] p-8 shadow-sm">
              <h3 className="text-xl font-lora font-bold text-[#2c2419] mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#8b6834]" />
                Recent Generations ({recentCards.length})
              </h3>

              {recentCards.length > 0 ? (
                <div className="overflow-hidden border border-[#e5e5e5] rounded">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#f5f0e8] text-[#5d4e37] font-bold uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Theme</th>
                        <th className="px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e5e5]">
                      {recentCards.map((card) => (
                        <tr key={card.id} className="bg-white hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-[#8b6834]">
                            #{card.id}
                          </td>
                          <td className="px-4 py-3">{card.theme}</td>
                          <td className="px-4 py-3 text-[#5d4e37]">
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
          <div className="space-y-6">
            {/* Quick Actions Panel */}
            <div className="bg-[#2c2419] text-[#faf8f5] p-6 shadow-lg rounded-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Shield className="w-32 h-32" />
              </div>
              <h3 className="text-lg font-lora font-bold mb-4 border-b border-[#faf8f5]/20 pb-2">
                Administrative Actions
              </h3>

              <div className="space-y-4 relative z-10">
                <div>
                  <label className="text-xs font-bold uppercase text-[#d4c4b0] mb-2 block">
                    Change Plan
                  </label>
                  <div className="space-y-2">
                    {(["Free", "Basic", "Premium"] as const).map((plan) => (
                      <button
                        key={plan}
                        onClick={() => handlePlanChange(plan)}
                        disabled={user.plan === plan || updating}
                        className={`w-full px-4 py-3 text-xs font-bold uppercase tracking-wider text-left transition-all flex items-center justify-between border ${
                          user.plan === plan
                            ? "bg-[#faf8f5] text-[#2c2419] border-[#faf8f5]"
                            : "bg-transparent text-[#d4c4b0] border-[#d4c4b0]/30 hover:bg-[#faf8f5]/10 hover:border-[#faf8f5]"
                        }`}
                      >
                        {plan}
                        {user.plan === plan && (
                          <div className="h-2 w-2 bg-[#2c2419] rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#faf8f5]/20">
                  <label className="text-xs font-bold uppercase text-[#d4c4b0] mb-2 block">
                    Account Status
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
            <div className="bg-white border border-[#d4c4b0] p-6 shadow-sm">
              <h3 className="text-lg font-lora font-bold text-[#2c2419] mb-4 flex items-center gap-2 uppercase tracking-wide border-b border-[#f5f0e8] pb-2">
                <CreditCard className="w-5 h-5 text-[#8b6834]" />
                Usage Details
              </h3>

              <div className="space-y-4">
                <div className="bg-[#fcfbf9] p-4 border border-[#d4c4b0]">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold uppercase text-[#5d4e37] tracking-widest">
                      Daily Usage (Web)
                    </span>
                    <span className="text-xl font-bold text-[#2c2419] font-mono leading-none">
                      {user.cards_generated_today}
                      <span className="text-xs text-[#a08d74] font-normal mx-1">
                        /
                      </span>
                      {user.daily_limit === -1 ? "∞" : user.daily_limit}
                    </span>
                  </div>
                  {user.daily_limit !== -1 && (
                    <div className="w-full bg-[#e5e5e5] h-1.5 mt-2 border border-[#d4c4b0] overflow-hidden">
                      <div
                        className={`h-full ${
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
                <div className="bg-[#fcfbf9] p-4 border border-[#d4c4b0]">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase text-[#5d4e37] tracking-widest">
                      API Usage Today
                    </span>
                    <span className="text-xl font-bold text-[#4a7c59] font-mono leading-none">
                      {user.api_usage_today || 0}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-[#d4c4b0] text-center">
                    <p className="text-xs uppercase font-bold text-[#a08d74] mb-1">
                      Lifetime
                    </p>
                    <p className="text-xl font-bold text-[#2c2419]">
                      {user.total_cards_generated}
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-[#d4c4b0] text-center">
                    <p className="text-xs uppercase font-bold text-[#a08d74] mb-1">
                      Batch Mode
                    </p>
                    <p
                      className={`text-xs font-bold uppercase tracking-wider ${
                        user.batch_processing_enabled
                          ? "text-[#4a7c59]"
                          : "text-[#a08d74]"
                      }`}
                    >
                      {user.batch_processing_enabled ? "ON" : "OFF"}
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
