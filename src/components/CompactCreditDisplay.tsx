'use client';

import { useAuth } from '@/contexts/AuthContext';
import { CreditCard } from 'lucide-react';

export default function CompactCreditDisplay() {
  const { user, credits } = useAuth();

  if (!user || !credits) return null;

  const used = credits.cards_generated_today || 0;
  const limit = credits.daily_limit;
  const remaining = Math.max(0, limit - used); // Never go negative
  const isPremium = user.plan === 'Premium';

  return (
    <div className="flex items-center gap-2 bg-white px-3 py-2 border-2 border-[#d4c4b0]">
      <CreditCard className="w-4 h-4 text-[#8b6834]" />
      <div className="flex items-center gap-2">
        <span className="text-xs font-inter font-medium text-[#2c2419]">
          {isPremium ? 'All unlocked' : `${remaining}`}
        </span>
        {!isPremium && (
          <span className="text-xs font-inter text-[#5d4e37] hidden sm:inline">
            {user.plan}
          </span>
        )}
      </div>
    </div>
  );
}
