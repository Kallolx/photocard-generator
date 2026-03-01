"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Bell, Search, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { adminAPI } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function AdminHeader({
  toggleSidebar,
}: {
  toggleSidebar?: () => void;
}) {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await adminAPI.getNotifications();
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await adminAPI.markNotificationRead(id);
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to mark read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await adminAPI.markAllNotificationsRead();
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to mark all read");
    }
  };

  return (
    <header className="h-14 lg:h-16 bg-white border-b border-[#d4c4b0]/40 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 text-[#5d4e37] hover:bg-[#f5f0e8] border border-[#d4c4b0] shadow-none"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Search - Soft Boxed Style */}
        <div className="hidden md:flex items-center gap-2 bg-[#f5f0e8]/50 border border-[#d4c4b0]/40 px-4 py-2 w-80 focus-within:bg-white focus-within:border-[#8b6834]/40 transition-all rounded-none">
          <Search className="w-4 h-4 text-[#a08d74]" />
          <input
            type="text"
            placeholder="SEARCH TOOLS OR USERS..."
            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest placeholder-[#a08d74]/60 focus:outline-none w-full text-[#2c2419]"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-[#5d4e37] hover:bg-[#f5f0e8] hover:text-[#8b6834] transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border border-[#faf8f5]"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#d4c4b0]/60 shadow-sm z-50 max-h-[80vh] flex flex-col">
              <div className="p-4 border-b border-[#f5f0e8] bg-[#faf8f5] flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#2c2419]">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-[#8b6834] hover:underline font-bold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[#a08d74] text-sm italic">
                    No new notifications
                  </div>
                ) : (
                  <div className="divide-y divide-[#f5f0e8]">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() =>
                          !notif.is_read && handleMarkRead(notif.id)
                        }
                        className={`p-4 hover:bg-[#fcfbf9] transition-colors cursor-pointer ${
                          !notif.is_read
                            ? "bg-[#faf8f5]/50 border-l-4 border-[#8b6834]"
                            : "border-l-4 border-transparent opacity-70"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p
                            className={`text-[11px] font-black uppercase tracking-tight ${!notif.is_read ? "text-[#2c2419]" : "text-[#5d4e37]/70"}`}
                          >
                            {notif.title}
                          </p>
                          <span className="text-[9px] font-bold text-[#a08d74] uppercase">
                            {new Date(notif.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-tight text-[#5d4e37]/80 leading-snug">
                          {notif.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 hover:bg-[#f5f0e8] border border-transparent hover:border-[#d4c4b0] transition-colors"
          >
            <div className="w-10 h-10 bg-[#e8dcc8] text-[#8b6834] flex items-center justify-center font-bold text-lg border-2 border-white shadow-none">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="hidden md:block text-left pr-2">
              <p className="text-xs font-black text-[#2c2419] uppercase tracking-tight leading-none">
                {user?.name || "Admin"}
              </p>
              <p className="text-[9px] font-bold text-[#8b6834] uppercase tracking-widest mt-0.5">
                Administrator
              </p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#d4c4b0]/60 shadow-sm z-50">
              <div className="p-4 border-b border-[#f5f0e8] bg-[#faf8f5]">
                <p className="text-[9px] font-black text-[#a08d74] uppercase tracking-widest mb-1.5">
                  Signed in as
                </p>
                <p className="text-[11px] font-black text-[#2c2419] uppercase tracking-tight truncate">
                  {user?.email}
                </p>
              </div>
              <div className="p-1">
                <button className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#5d4e37] hover:bg-[#f5f0e8] hover:text-[#2c2419] transition-colors">
                  Account Settings
                </button>
                <div className="h-px bg-[#f5f0e8] my-1 mx-2"></div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
