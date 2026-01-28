'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, CreditCard, Calendar } from 'lucide-react';
import { adminAPI } from '@/lib/api';

interface UserDetails {
  id: number;
  name: string;
  email: string;
  plan: 'Free' | 'Basic' | 'Premium';
  status: 'active' | 'inactive';
  created_at: string;
  daily_limit: number;
  cards_generated_today: number;
  total_cards_generated: number;
  batch_processing_enabled: boolean;
  custom_cards_enabled: boolean;
  api_access_enabled: boolean;
}

interface RecentCard {
  id: number;
  theme: string;
  created_at: string;
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [recentCards, setRecentCards] = useState<RecentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const response = await adminAPI.getUser(id);
      if (response.success) {
        setUser(response.data.user);
        setRecentCards(response.data.recentCards || []);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (newPlan: 'Free' | 'Basic' | 'Premium') => {
    if (!user || updating) return;
    
    setUpdating(true);
    try {
      const response = await adminAPI.updateUserPlan(id, newPlan);
      if (response.success) {
        setUser({ ...user, plan: newPlan });
      }
    } catch (error) {
      console.error('Failed to update plan:', error);
      alert('Failed to update plan');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (!user || updating) return;
    
    setUpdating(true);
    try {
      const response = await adminAPI.updateUserStatus(id, newStatus);
      if (response.success) {
        setUser({ ...user, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#d4c4b0] border-t-[#8b6834]"></div>
          <p className="mt-4 text-[#5d4e37] font-inter">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="bg-white border-2 border-[#d4c4b0] p-12 text-center">
          <p className="text-[#5d4e37] font-inter mb-4">User not found</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="px-6 py-2 bg-[#8b6834] text-white font-inter hover:bg-[#6d5229] transition-colors"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/users')}
          className="p-2 border-2 border-[#d4c4b0] hover:bg-[#f5f0e8] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#8b6834]" />
        </button>
        <div>
          <h2 className="text-3xl font-lora font-bold text-[#2c2419]">{user.name}</h2>
          <p className="text-[#5d4e37] font-inter mt-1">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white border-2 border-[#d4c4b0] p-6">
            <h3 className="text-xl font-lora font-bold text-[#2c2419] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#8b6834]" />
              User Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-inter text-[#5d4e37] mb-1">User ID</p>
                <p className="text-lg font-inter text-[#2c2419]">{user.id}</p>
              </div>
              <div>
                <p className="text-sm font-inter text-[#5d4e37] mb-1">Status</p>
                <span className={`inline-block px-3 py-1 text-sm font-inter font-semibold capitalize ${
                  user.status === 'active' ? 'bg-[#4a7c59] text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {user.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-inter text-[#5d4e37] mb-1">Plan</p>
                <span className={`inline-block px-3 py-1 text-sm font-inter font-semibold ${
                  user.plan === 'Premium' ? 'bg-[#8b6834] text-white' :
                  user.plan === 'Basic' ? 'bg-[#d4c4b0] text-[#2c2419]' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {user.plan}
                </span>
              </div>
              <div>
                <p className="text-sm font-inter text-[#5d4e37] mb-1">Joined</p>
                <p className="text-lg font-inter text-[#2c2419]">{formatDate(user.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Credits Info */}
          <div className="bg-white border-2 border-[#d4c4b0] p-6">
            <h3 className="text-xl font-lora font-bold text-[#2c2419] mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#8b6834]" />
              Credits & Features
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-inter text-[#5d4e37] mb-1">Daily Limit</p>
                <p className="text-2xl font-lora font-bold text-[#2c2419]">{user.daily_limit === -1 ? 'Unlimited' : user.daily_limit}</p>
              </div>
              <div>
                <p className="text-sm font-inter text-[#5d4e37] mb-1">Generated Today</p>
                <p className="text-2xl font-lora font-bold text-[#2c2419]">{user.cards_generated_today}</p>
              </div>
              <div>
                <p className="text-sm font-inter text-[#5d4e37] mb-1">Total Cards</p>
                <p className="text-2xl font-lora font-bold text-[#2c2419]">{user.total_cards_generated}</p>
              </div>
              <div>
                <p className="text-sm font-inter text-[#5d4e37] mb-1">Batch Processing</p>
                <span className={`inline-block px-3 py-1 text-sm font-inter font-semibold ${
                  user.batch_processing_enabled ? 'bg-[#4a7c59] text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {user.batch_processing_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Cards */}
          <div className="bg-white border-2 border-[#d4c4b0] p-6">
            <h3 className="text-xl font-lora font-bold text-[#2c2419] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#8b6834]" />
              Recent Cards ({recentCards.length})
            </h3>
            {recentCards.length > 0 ? (
              <div className="space-y-3">
                {recentCards.map((card) => (
                  <div key={card.id} className="flex justify-between items-center p-3 bg-[#f5f0e8]">
                    <div>
                      <p className="font-inter text-[#2c2419]">Card #{card.id}</p>
                      <p className="text-sm font-inter text-[#5d4e37]">Theme: {card.theme}</p>
                    </div>
                    <p className="text-sm font-inter text-[#5d4e37]">{formatDate(card.created_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#5d4e37] font-inter text-center py-4">No cards generated yet</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          {/* Change Plan */}
          <div className="bg-white border-2 border-[#d4c4b0] p-6">
            <h3 className="text-lg font-lora font-bold text-[#2c2419] mb-4">Change Plan</h3>
            <div className="space-y-2">
              {(['Free', 'Basic', 'Premium'] as const).map((plan) => (
                <button
                  key={plan}
                  onClick={() => handlePlanChange(plan)}
                  disabled={user.plan === plan || updating}
                  className={`w-full px-4 py-3 font-inter text-left transition-colors ${
                    user.plan === plan
                      ? 'bg-[#8b6834] text-white cursor-default'
                      : 'border-2 border-[#d4c4b0] text-[#2c2419] hover:bg-[#f5f0e8] disabled:opacity-50'
                  }`}
                >
                  {plan}
                  {user.plan === plan && ' (Current)'}
                </button>
              ))}
            </div>
          </div>

          {/* Change Status */}
          <div className="bg-white border-2 border-[#d4c4b0] p-6">
            <h3 className="text-lg font-lora font-bold text-[#2c2419] mb-4">Change Status</h3>
            <div className="space-y-2">
              {(['active', 'inactive'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={user.status === status || updating}
                  className={`w-full px-4 py-3 font-inter text-left capitalize transition-colors ${
                    user.status === status
                      ? 'bg-[#8b6834] text-white cursor-default'
                      : 'border-2 border-[#d4c4b0] text-[#2c2419] hover:bg-[#f5f0e8] disabled:opacity-50'
                  }`}
                >
                  {status}
                  {user.status === status && ' (Current)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
