"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true}>
      <div className="flex h-screen bg-[#faf8f5]">
        {/* Sidebar - Desktop */}
        <div className="hidden md:block h-full">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden overflow-hidden">
            <div
              className={`absolute inset-0 bg-[#2c2419]/60 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
              onClick={() => setSidebarOpen(false)}
            />
            <div
              className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl border-r border-[#d4c4b0]/40"
              style={{
                animation: "slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <AdminSidebar onItemClick={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <AdminHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 overflow-auto p-0">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
