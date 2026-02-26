"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/lib/api";
import { User, Mail, Save, Loader2 } from "lucide-react";

export default function ProfileSettings() {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await userAPI.updateProfile(name, email);

      if (response.success) {
        setMessage("Profile updated successfully");
        await refreshProfile();
      } else {
        setError(response.message || "Failed to update profile");
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
        Profile Details
      </h2>
      <p className="text-[#5d4e37] text-sm mb-6 font-inter">
        Update your personal information
      </p>

      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm border border-green-200">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[#2c2419] font-inter">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b6834]/60" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#d4c4b0] focus:outline-none focus:ring-2 focus:ring-[#8b6834]/20 focus:border-[#8b6834] transition-all font-inter text-[#2c2419]"
              placeholder="Your Name"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[#2c2419] font-inter">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b6834]/60" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#d4c4b0] focus:outline-none focus:ring-2 focus:ring-[#8b6834]/20 focus:border-[#8b6834] transition-all font-inter text-[#2c2419]"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-[#8b6834] hover:bg-[#6b4e25] text-white px-6 py-2.5 font-bold font-inter transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin rounded-full" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
