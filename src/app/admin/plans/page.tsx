'use client';

import { useState, useEffect } from 'react';

interface Plan {
  id: string;
  name: 'Free' | 'Basic' | 'Premium';
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    cardsPerDay: number;
    customCards: boolean;
    batchProcessing: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
  };
  activeUsers: number;
  revenue: number;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: '1',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: [
        'Generate up to 10 cards per day',
        'Basic themes and fonts',
        'Standard quality export',
        'Community support',
      ],
      limits: {
        cardsPerDay: 10,
        customCards: false,
        batchProcessing: false,
        apiAccess: false,
        prioritySupport: false,
      },
      activeUsers: 456,
      revenue: 0,
    },
    {
      id: '2',
      name: 'Basic',
      price: 9.99,
      interval: 'month',
      features: [
        'Generate up to 100 cards per day',
        'All themes and fonts',
        'High quality export',
        'Custom card creation',
        'Email support',
      ],
      limits: {
        cardsPerDay: 100,
        customCards: true,
        batchProcessing: false,
        apiAccess: false,
        prioritySupport: false,
      },
      activeUsers: 234,
      revenue: 2337.66,
    },
    {
      id: '3',
      name: 'Premium',
      price: 29.99,
      interval: 'month',
      features: [
        'Unlimited card generation',
        'All themes and fonts',
        'Ultra HD export quality',
        'Custom cards with advanced options',
        'Batch processing (up to 50 URLs)',
        'API access',
        'Priority support',
        'Remove watermarks',
      ],
      limits: {
        cardsPerDay: -1, // unlimited
        customCards: true,
        batchProcessing: true,
        apiAccess: true,
        prioritySupport: true,
      },
      activeUsers: 166,
      revenue: 4978.34,
    },
  ]);

  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // TODO: Replace with actual API calls
  useEffect(() => {
    // Fetch plans from API
  }, []);

  const handleUpdatePlan = (planId: string, updates: Partial<Plan>) => {
    // TODO: Implement plan update with proper validation and authorization
    setPlans(plans.map(plan => 
      plan.id === planId ? { ...plan, ...updates } : plan
    ));
    setEditingPlan(null);
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'Premium':
        return 'bg-[#8b6834] text-[#faf8f5]';
      case 'Basic':
        return 'bg-[#d4c4b0] text-[#2c2419]';
      default:
        return 'bg-[#f5f0e8] text-[#5d4e37]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-lora font-bold text-[#2c2419] mb-2">Plan Management</h2>
          <p className="text-[#5d4e37] font-inter">Manage subscription plans and pricing</p>
        </div>
        <button className="px-6 py-3 bg-[#8b6834] text-[#faf8f5] font-inter font-semibold hover:bg-[#6b4e25]">
          + Create New Plan
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white border-2 border-[#d4c4b0] p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 text-sm font-inter font-semibold ${getPlanColor(plan.name)}`}>
                {plan.name}
              </span>
              <span className="text-2xl font-lora font-bold text-[#2c2419]">
                ${plan.price}
                <span className="text-sm text-[#5d4e37]">/{plan.interval}</span>
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-inter text-[#5d4e37]">Active Users</span>
                <span className="text-sm font-inter font-semibold text-[#2c2419]">{plan.activeUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-inter text-[#5d4e37]">Monthly Revenue</span>
                <span className="text-sm font-inter font-semibold text-[#2c2419]">${plan.revenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white border-2 border-[#d4c4b0]">
            {/* Plan Header */}
            <div className={`p-6 ${getPlanColor(plan.name)}`}>
              <h3 className="text-2xl font-lora font-bold mb-2">{plan.name}</h3>
              <div className="text-3xl font-lora font-bold">
                ${plan.price}
                <span className="text-lg font-inter font-normal">/{plan.interval}</span>
              </div>
            </div>

            {/* Features */}
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-inter font-semibold text-[#2c2419] mb-3">Features</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-[#4a7c59] mr-2">✓</span>
                      <span className="text-sm font-inter text-[#5d4e37]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t-2 border-[#d4c4b0]">
                <h4 className="font-inter font-semibold text-[#2c2419] mb-3">Limits</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-inter text-[#5d4e37]">Cards/Day</span>
                    <span className="text-sm font-inter font-semibold text-[#2c2419]">
                      {plan.limits.cardsPerDay === -1 ? 'Unlimited' : plan.limits.cardsPerDay}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-inter text-[#5d4e37]">Custom Cards</span>
                    <span className="text-sm font-inter font-semibold text-[#2c2419]">
                      {plan.limits.customCards ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-inter text-[#5d4e37]">Batch Processing</span>
                    <span className="text-sm font-inter font-semibold text-[#2c2419]">
                      {plan.limits.batchProcessing ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-inter text-[#5d4e37]">API Access</span>
                    <span className="text-sm font-inter font-semibold text-[#2c2419]">
                      {plan.limits.apiAccess ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-2">
                <button
                  onClick={() => setEditingPlan(plan)}
                  className="w-full py-2 bg-[#8b6834] text-[#faf8f5] font-inter font-medium hover:bg-[#6b4e25]"
                >
                  Edit Plan
                </button>
                <button className="w-full py-2 bg-[#f5f0e8] text-[#2c2419] font-inter font-medium hover:bg-[#e8dcc8] border-2 border-[#d4c4b0]">
                  View Subscribers
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-[#d4c4b0] max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-lora font-bold text-[#2c2419]">Edit {editingPlan.name} Plan</h3>
              <button
                onClick={() => setEditingPlan(null)}
                className="text-[#5d4e37] hover:text-[#2c2419]"
              >
                ✕
              </button>
            </div>

            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              handleUpdatePlan(editingPlan.id, editingPlan);
            }}>
              {/* Price */}
              <div>
                <label className="block text-sm font-inter font-semibold text-[#2c2419] mb-2">
                  Price (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingPlan.price}
                  onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] font-inter focus:outline-none focus:ring-2 focus:ring-[#8b6834]"
                />
              </div>

              {/* Cards Per Day */}
              <div>
                <label className="block text-sm font-inter font-semibold text-[#2c2419] mb-2">
                  Cards Per Day (-1 for unlimited)
                </label>
                <input
                  type="number"
                  value={editingPlan.limits.cardsPerDay}
                  onChange={(e) => setEditingPlan({
                    ...editingPlan,
                    limits: { ...editingPlan.limits, cardsPerDay: parseInt(e.target.value) }
                  })}
                  className="w-full px-4 py-2 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] font-inter focus:outline-none focus:ring-2 focus:ring-[#8b6834]"
                />
              </div>

              {/* Feature Toggles */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingPlan.limits.customCards}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      limits: { ...editingPlan.limits, customCards: e.target.checked }
                    })}
                    className="w-4 h-4 border-2 border-[#d4c4b0] text-[#8b6834] focus:ring-[#8b6834]"
                  />
                  <span className="ml-2 font-inter text-[#2c2419]">Enable Custom Cards</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingPlan.limits.batchProcessing}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      limits: { ...editingPlan.limits, batchProcessing: e.target.checked }
                    })}
                    className="w-4 h-4 border-2 border-[#d4c4b0] text-[#8b6834] focus:ring-[#8b6834]"
                  />
                  <span className="ml-2 font-inter text-[#2c2419]">Enable Batch Processing</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingPlan.limits.apiAccess}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      limits: { ...editingPlan.limits, apiAccess: e.target.checked }
                    })}
                    className="w-4 h-4 border-2 border-[#d4c4b0] text-[#8b6834] focus:ring-[#8b6834]"
                  />
                  <span className="ml-2 font-inter text-[#2c2419]">Enable API Access</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingPlan.limits.prioritySupport}
                    onChange={(e) => setEditingPlan({
                      ...editingPlan,
                      limits: { ...editingPlan.limits, prioritySupport: e.target.checked }
                    })}
                    className="w-4 h-4 border-2 border-[#d4c4b0] text-[#8b6834] focus:ring-[#8b6834]"
                  />
                  <span className="ml-2 font-inter text-[#2c2419]">Enable Priority Support</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#8b6834] text-[#faf8f5] font-inter font-semibold hover:bg-[#6b4e25]"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="flex-1 py-3 bg-[#f5f0e8] text-[#2c2419] font-inter font-semibold hover:bg-[#e8dcc8] border-2 border-[#d4c4b0]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Billing Settings */}
      <div className="bg-white border-2 border-[#d4c4b0] p-6">
        <h3 className="text-xl font-lora font-bold text-[#2c2419] mb-4">Billing Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-inter font-semibold text-[#2c2419] mb-2">
              Payment Gateway
            </label>
            <select className="w-full px-4 py-2 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] font-inter focus:outline-none focus:ring-2 focus:ring-[#8b6834]">
              <option>Stripe</option>
              <option>PayPal</option>
              <option>Razorpay</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-inter font-semibold text-[#2c2419] mb-2">
              Currency
            </label>
            <select className="w-full px-4 py-2 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] font-inter focus:outline-none focus:ring-2 focus:ring-[#8b6834]">
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>INR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-inter font-semibold text-[#2c2419] mb-2">
              Trial Period (days)
            </label>
            <input
              type="number"
              defaultValue={7}
              className="w-full px-4 py-2 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] font-inter focus:outline-none focus:ring-2 focus:ring-[#8b6834]"
            />
          </div>
          <div>
            <label className="block text-sm font-inter font-semibold text-[#2c2419] mb-2">
              Billing Cycle
            </label>
            <select className="w-full px-4 py-2 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] font-inter focus:outline-none focus:ring-2 focus:ring-[#8b6834]">
              <option>Monthly</option>
              <option>Yearly</option>
              <option>Lifetime</option>
            </select>
          </div>
        </div>
        <button className="mt-6 px-6 py-3 bg-[#8b6834] text-[#faf8f5] font-inter font-semibold hover:bg-[#6b4e25]">
          Save Billing Settings
        </button>
      </div>
    </div>
  );
}
