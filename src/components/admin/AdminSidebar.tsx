"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Home,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminSidebar({
  onItemClick,
}: {
  onItemClick?: () => void;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-72 bg-white border-r border-[#d4c4b0]/40 flex flex-col h-full font-inter text-[#5d4e37]">
      {/* Brand Header */}
      <div className="h-14 lg:h-16 flex items-center px-6 border-b border-[#d4c4b0]/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#8b6834] to-[#5d4e37] flex items-center justify-center text-white">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#2c2419] tracking-tight">
              Socialcard
            </h1>
            <p className="text-[10px] font-medium tracking-widest text-[#8b6834] uppercase opacity-70">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onItemClick}
              className={`group flex items-center justify-between px-4 py-3 transition-all rounded-none ${
                active
                  ? "bg-[#8b6834] text-white"
                  : "text-[#5d4e37] hover:bg-[#f5f0e8] hover:text-[#2c2419]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    active
                      ? "text-white"
                      : "text-[#a08d74] group-hover:text-[#8b6834]"
                  }`}
                />
                <span className="text-sm font-medium">
                  {item.name}
                </span>
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5 text-white" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[#d4c4b0]/40">
        <div className="space-y-1">
          <Link
            href="/"
            onClick={onItemClick}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5d4e37] hover:bg-[#f5f0e8] hover:text-[#2c2419] transition-colors"
          >
            <Home className="w-4 h-4" />
            Return to App
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border border-transparent hover:border-red-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
