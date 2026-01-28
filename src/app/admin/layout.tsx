'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, LogOut, Home } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true}>
      <div className="flex h-screen bg-[#faf8f5]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r-2 border-[#d4c4b0] flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b-2 border-[#d4c4b0]">
            <h1 className="text-2xl font-lora font-bold text-[#2c2419]">Admin Panel</h1>
            <p className="text-xs text-[#5d4e37] font-inter mt-1">{user?.email}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded font-inter font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#f5f0e8] text-[#8b6834] border-l-4 border-[#8b6834]'
                      : 'text-[#5d4e37] hover:bg-[#faf8f5] hover:text-[#8b6834]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t-2 border-[#d4c4b0] space-y-2">
            <Link
              href="/url"
              className="flex items-center gap-3 px-4 py-3 rounded font-inter font-medium text-[#5d4e37] hover:bg-[#faf8f5] hover:text-[#8b6834] transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Back to App</span>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded font-inter font-medium text-[#5d4e37] hover:bg-[#f5f0e8] hover:text-[#c19a6b] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
