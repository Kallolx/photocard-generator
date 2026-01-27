'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Users & Subscriptions', href: '/admin/users' },
  ];

  // TODO: Implement role checking with useAuth hook
  // Redirect non-admins to appropriate page

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b-2 border-[#d4c4b0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-lora font-bold text-[#2c2419]">Admin Panel</h1>
              
              <div className="flex space-x-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-4 py-2 font-inter font-medium transition-colors ${
                        isActive
                          ? 'text-[#8b6834] border-b-2 border-[#8b6834]'
                          : 'text-[#5d4e37] hover:text-[#2c2419]'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href="/url"
                className="px-4 py-2 bg-[#f5f0e8] text-[#2c2419] font-inter font-medium hover:bg-[#e8dcc8] border border-[#d4c4b0]"
              >
                Back to App
              </Link>
              <button className="px-4 py-2 bg-[#8b6834] text-[#faf8f5] font-inter font-medium hover:bg-[#6b4e25]">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
