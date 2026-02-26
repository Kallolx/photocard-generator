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
    <aside className="w-72 bg-[#faf8f5] border-r border-[#d4c4b0]/40 flex flex-col h-full font-inter text-[#5d4e37]">
      {/* Brand Header - Warm & Elegant */}
      <div className="h-24 flex items-center px-6 border-b border-[#d4c4b0]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2c2419] border-2 border-[#2c2419] flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#8b6834]">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-black text-[#2c2419] tracking-tight uppercase">
              Socialcard
            </h1>
            <p className="text-[10px] font-black tracking-widest text-[#8b6834] uppercase opacity-70">
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
              className={`group flex items-center justify-between px-4 py-3 border transition-all rounded-none ${
                active
                  ? "bg-[#8b6834] text-white border-[#2c2419] shadow-[2px_2px_0px_0px_#2c2419]"
                  : "text-[#5d4e37] border-transparent hover:bg-[#f5f0e8] hover:text-[#2c2419] hover:border-[#d4c4b0]/40"
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
                <span className="text-xs font-bold uppercase tracking-tight">
                  {item.name}
                </span>
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5 text-white" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[#d4c4b0]/40 bg-[#faf8f5]/50">
        <div className="space-y-2">
          <Link
            href="/"
            onClick={onItemClick}
            className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#5d4e37] hover:bg-white hover:text-[#2c2419] transition-all border border-transparent hover:border-[#d4c4b0]/40 active:translate-x-[1px] active:translate-y-[1px]"
          >
            <Home className="w-4 h-4" />
            Return to App
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-all border border-transparent active:translate-x-[1px] active:translate-y-[1px]"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
