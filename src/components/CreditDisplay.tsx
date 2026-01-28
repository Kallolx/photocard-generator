'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function CreditDisplay() {
  const { user, credits, remainingCards, canGenerateCard } = useAuth();

  if (!user || !credits) return null;

  const remaining = remainingCards();
  const isUnlimited = remaining === -1;

  return (
    <div className="bg-white border-2 border-[#d4c4b0] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-inter font-semibold text-[#2c2419]">
          Your Plan: <span className="text-[#8b6834]">{user.plan}</span>
        </h3>
        {user.plan === 'Free' && (
          <a
            href="#pricing"
            className="text-xs font-inter font-medium text-[#8b6834] hover:text-[#6b4e25]"
          >
            Upgrade →
          </a>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-inter text-[#5d4e37]">Cards Today:</span>
          <span className="text-sm font-inter font-semibold text-[#2c2419]">
            {credits.cards_generated_today} / {isUnlimited ? '∞' : credits.daily_limit}
          </span>
        </div>

        {!isUnlimited && (
          <div className="w-full bg-[#f5f0e8] h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                canGenerateCard() ? 'bg-[#8b6834]' : 'bg-[#c19a6b]'
              }`}
              style={{
                width: `${(credits.cards_generated_today / credits.daily_limit) * 100}%`,
              }}
            />
          </div>
        )}

        {!canGenerateCard() && !isUnlimited && (
          <p className="text-xs font-inter text-[#c19a6b] mt-2">
            Daily limit reached. Resets in 24 hours or upgrade for more cards.
          </p>
        )}

        {canGenerateCard() && !isUnlimited && (
          <p className="text-xs font-inter text-[#4a7c59] mt-2">
            {remaining} cards remaining today
          </p>
        )}
      </div>
    </div>
  );
}
