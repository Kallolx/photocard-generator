"use client";

import { useState } from "react";
import { Lock, Key, Check, Loader2, AlertCircle } from "lucide-react";
import { userAPI } from "@/lib/api";

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await userAPI.changePassword(
        currentPassword,
        newPassword,
      );

      if (response.success) {
        setMessage("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(response.message || "Failed to change password");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again.",
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#d4c4b0]/40 p-6 md:p-8 shadow-sm">
      <h2 className="text-xl font-lora font-bold text-[#2c2419] mb-1">
        Security
      </h2>
      <p className="text-[#5d4e37] text-sm mb-6 font-inter">
        Manage your password and security settings
      </p>

      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm border border-green-200 flex items-center gap-2">
          <Check className="w-4 h-4" /> {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[#2c2419] font-inter">
            Current Password
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b6834]/60" />
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#d4c4b0] focus:outline-none focus:ring-2 focus:ring-[#8b6834]/20 focus:border-[#8b6834] transition-all font-inter text-[#2c2419]"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2c2419] font-inter">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b6834]/60" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#d4c4b0] focus:outline-none focus:ring-2 focus:ring-[#8b6834]/20 focus:border-[#8b6834] transition-all font-inter text-[#2c2419]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#2c2419] font-inter">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b6834]/60" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#d4c4b0] focus:outline-none focus:ring-2 focus:ring-[#8b6834]/20 focus:border-[#8b6834] transition-all font-inter text-[#2c2419]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-[#2c2419] hover:bg-[#4a3e2f] text-white px-6 py-2.5 font-bold font-inter transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin rounded-full" />
                Updating Password...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
