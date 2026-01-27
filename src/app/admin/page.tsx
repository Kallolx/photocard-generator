'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 1234,
    activeSubscriptions: 856,
    monthlyRevenue: 24567,
    freeUsers: 378,
    basicUsers: 234,
    premiumUsers: 166,
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, user: 'John Doe', email: 'john@example.com', action: 'Upgraded to Premium', time: '5 minutes ago', type: 'upgrade' },
    { id: 2, user: 'Jane Smith', email: 'jane@example.com', action: 'New registration', time: '12 minutes ago', type: 'signup' },
    { id: 3, user: 'Bob Wilson', email: 'bob@example.com', action: 'Payment received - $29.99', time: '23 minutes ago', type: 'payment' },
    { id: 4, user: 'Alice Brown', email: 'alice@example.com', action: 'Canceled subscription', time: '1 hour ago', type: 'cancel' },
    { id: 5, user: 'Charlie Davis', email: 'charlie@example.com', action: 'Upgraded to Basic', time: '2 hours ago', type: 'upgrade' },
  ]);

  // TODO: Replace with actual API calls to fetch real-time data
  useEffect(() => {
    // Simulate fetching dashboard data
  }, []);

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'upgrade':
        return 'text-[#4a7c59]';
      case 'payment':
        return 'text-[#8b6834]';
      case 'cancel':
        return 'text-[#c19a6b]';
      default:
        return 'text-[#5d4e37]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-lora font-bold text-[#2c2419] mb-2">Dashboard</h2>
        <p className="text-[#5d4e37] font-inter">Overview of users and subscriptions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-[#d4c4b0] p-6">
          <h3 className="text-sm font-inter font-semibold text-[#5d4e37] mb-2">Total Users</h3>
          <p className="text-3xl font-lora font-bold text-[#2c2419]">{stats.totalUsers.toLocaleString()}</p>
          <p className="text-xs font-inter text-[#5d4e37] mt-1">All registered accounts</p>
        </div>

        <div className="bg-white border-2 border-[#d4c4b0] p-6">
          <h3 className="text-sm font-inter font-semibold text-[#5d4e37] mb-2">Active Subscriptions</h3>
          <p className="text-3xl font-lora font-bold text-[#2c2419]">{stats.activeSubscriptions.toLocaleString()}</p>
          <p className="text-xs font-inter text-[#5d4e37] mt-1">Paying customers</p>
        </div>

        <div className="bg-white border-2 border-[#d4c4b0] p-6">
          <h3 className="text-sm font-inter font-semibold text-[#5d4e37] mb-2">Monthly Revenue</h3>
          <p className="text-3xl font-lora font-bold text-[#2c2419]">${stats.monthlyRevenue.toLocaleString()}</p>
          <p className="text-xs font-inter text-[#5d4e37] mt-1">Current month</p>
        </div>
      </div>

      {/* Subscription Breakdown */}
      <div className="bg-white border-2 border-[#d4c4b0] p-6">
        <h3 className="text-xl font-lora font-bold text-[#2c2419] mb-4">Subscription Breakdown</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center p-4 bg-[#faf8f5] border border-[#d4c4b0]">
            <p className="text-2xl font-lora font-bold text-[#2c2419]">{stats.freeUsers}</p>
            <p className="text-sm font-inter text-[#5d4e37] mt-1">Free Plan</p>
          </div>
          <div className="text-center p-4 bg-[#faf8f5] border border-[#d4c4b0]">
            <p className="text-2xl font-lora font-bold text-[#2c2419]">{stats.basicUsers}</p>
            <p className="text-sm font-inter text-[#5d4e37] mt-1">Basic Plan ($9.99)</p>
          </div>
          <div className="text-center p-4 bg-[#faf8f5] border border-[#d4c4b0]">
            <p className="text-2xl font-lora font-bold text-[#2c2419]">{stats.premiumUsers}</p>
            <p className="text-sm font-inter text-[#5d4e37] mt-1">Premium Plan ($29.99)</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border-2 border-[#d4c4b0] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-lora font-bold text-[#2c2419]">Recent Activity</h3>
          <Link
            href="/admin/users"
            className="text-sm font-inter font-medium text-[#8b6834] hover:text-[#6b4e25]"
          >
            View all users →
          </Link>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between py-3 border-b border-[#d4c4b0] last:border-b-0"
            >
              <div>
                <p className="font-inter font-medium text-[#2c2419]">{activity.user}</p>
                <p className="text-sm font-inter text-[#5d4e37]">{activity.email}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-inter font-medium ${getActivityColor(activity.type)}`}>
                  {activity.action}
                </p>
                <p className="text-xs font-inter text-[#5d4e37]">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
