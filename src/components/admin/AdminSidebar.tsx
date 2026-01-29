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

export default function AdminSidebar() {
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
    <aside className="w-72 bg-[#faf8f5] border-r-2 border-[#d4c4b0] flex flex-col hidden md:flex h-full font-inter text-[#5d4e37]">
      {/* Brand Header - Warm & Elegant */}
      <div className="h-20 flex items-center px-6 border-b-2 border-[#d4c4b0] bg-[#faf8f5]">
        <div>
          <h1 className="text-xl font-lora font-bold text-[#2c2419] tracking-tight">
            Socialcard
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-1.5 w-1.5 bg-[#8b6834] rounded-full inline-block"></span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#8b6834] uppercase">
              Admin Panel
            </span>
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
              className={`group flex items-center justify-between px-4 py-3 border border-transparent transition-colors ${
                active
                  ? "bg-[#f5f0e8] text-[#2c2419] border-[#d4c4b0] font-bold shadow-sm"
                  : "text-[#5d4e37] hover:bg-[#ffffff] hover:border-[#e5e5e5] hover:text-[#8b6834]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    active
                      ? "text-[#8b6834]"
                      : "text-[#a08d74] group-hover:text-[#8b6834]"
                  }`}
                />
                <span className="text-sm tracking-wide">{item.name}</span>
              </div>
              {active && <ChevronRight className="w-4 h-4 text-[#8b6834]" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t-2 border-[#d4c4b0] bg-[#fcfbf9]">
        <div className="space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#5d4e37] hover:bg-[#faf8f5] hover:text-[#2c2419] transition-colors border border-transparent hover:border-[#d4c4b0]"
          >
            <Home className="w-4 h-4" />
            Return to App
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors border border-transparent"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
