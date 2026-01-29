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
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-[#2c2419]/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72 animate-slide-in">
              <AdminSidebar />
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
