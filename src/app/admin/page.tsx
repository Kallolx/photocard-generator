'use client';

import { useState, useEffect } from 'react';
import { Users, CreditCard } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    free: 0,
    basic: 0,
    premium: 0,
    totalCards: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      if (response.success) {
        setStats({
          totalUsers: response.data.totalUsers,
          free: response.data.planStats.free || 0,
          basic: response.data.planStats.basic || 0,
          premium: response.data.planStats.premium || 0,
          totalCards: response.data.totalCards,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#d4c4b0] border-t-[#8b6834]"></div>
          <p className="mt-4 text-[#5d4e37] font-inter">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-lora font-bold text-[#2c2419]">Dashboard</h2>
        <p className="text-[#5d4e37] font-inter mt-1">Overview of your platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white border-2 border-[#d4c4b0] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter text-[#5d4e37] mb-1">Total Users</p>
              <p className="text-3xl font-lora font-bold text-[#2c2419]">{stats.totalUsers}</p>
            </div>
            <Users className="w-10 h-10 text-[#8b6834]" />
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white border-2 border-[#d4c4b0] p-6">
          <p className="text-sm font-inter text-[#5d4e37] mb-3">Plan Distribution</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-inter text-[#5d4e37]">Free</span>
              <span className="text-lg font-lora font-bold text-[#2c2419]">{stats.free}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-inter text-[#5d4e37]">Basic</span>
              <span className="text-lg font-lora font-bold text-[#2c2419]">{stats.basic}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-inter text-[#5d4e37]">Premium</span>
              <span className="text-lg font-lora font-bold text-[#8b6834]">{stats.premium}</span>
            </div>
          </div>
        </div>

        {/* Total Cards Generated */}
        <div className="bg-white border-2 border-[#d4c4b0] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-inter text-[#5d4e37] mb-1">Cards Generated</p>
              <p className="text-3xl font-lora font-bold text-[#2c2419]">{stats.totalCards}</p>
            </div>
            <CreditCard className="w-10 h-10 text-[#8b6834]" />
          </div>
        </div>
      </div>
    </div>
  );
}
