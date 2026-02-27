"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import PlanSettings from "@/components/settings/PlanSettings";
import DeveloperSettings from "@/components/settings/DeveloperSettings";
import IntegrationsSettings from "@/components/settings/IntegrationsSettings";
import { User, Shield, CreditCard, Terminal, Link2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "plans" | "developer" | "integrations"
  >("profile");
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#faf8f5]">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-lora font-bold text-[#2c2419]">
              Account Settings
            </h1>
            <p className="text-[#5d4e37] mt-1 font-inter">
              Manage your account preferences and security.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 flex-shrink-0">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "profile"
                      ? "bg-[#8b6834] text-white shadow-sm"
                      : "text-[#5d4e37] hover:bg-[#e5e7eb] hover:text-[#2c2419]"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "security"
                      ? "bg-[#8b6834] text-white shadow-sm"
                      : "text-[#5d4e37] hover:bg-[#e5e7eb] hover:text-[#2c2419]"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Security
                </button>
                <button
                  onClick={() => setActiveTab("plans")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "plans"
                      ? "bg-[#8b6834] text-white shadow-sm"
                      : "text-[#5d4e37] hover:bg-[#e5e7eb] hover:text-[#2c2419]"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Plan & Billing
                </button>
                <button
                  onClick={() => setActiveTab("developer")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "developer"
                      ? "bg-[#8b6834] text-white shadow-sm"
                      : "text-[#5d4e37] hover:bg-[#e5e7eb] hover:text-[#2c2419]"
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  Developer API
                </button>
                <button
                  onClick={() => setActiveTab("integrations")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "integrations"
                      ? "bg-[#8b6834] text-white shadow-sm"
                      : "text-[#5d4e37] hover:bg-[#e5e7eb] hover:text-[#2c2419]"
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  Integrations
                </button>
              </nav>

              {/* Account Status Card */}
              <div className="mt-8 bg-[#f5f0e8] p-4 border border-[#d4c4b0]/30 hidden md:block">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#d4c4b0] flex items-center justify-center text-[#2c2419] font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-[#2c2419] truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-[#5d4e37] truncate">
                      {user?.plan} Plan
                    </p>
                  </div>
                </div>
                <div className="text-xs text-[#8b6834] font-medium border-t border-[#d4c4b0]/30 pt-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500"></div>
                  Account Active
                </div>
              </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 max-w-3xl">
              {activeTab === "profile" && <ProfileSettings />}
              {activeTab === "security" && <SecuritySettings />}
              {activeTab === "plans" && <PlanSettings />}
              {activeTab === "developer" && <DeveloperSettings />}
              {activeTab === "integrations" && <IntegrationsSettings />}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
