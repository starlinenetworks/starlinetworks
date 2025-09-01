import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { PurchaseModal } from './PurchaseModal';
import { Plan } from '../../types';
import { Wifi, Clock, Zap, TrendingUp, Package, ChevronRight } from 'lucide-react';
import { getCorrectDurationDisplay } from '../../utils/planDurationHelper';

interface PlansListProps {
  showAll?: boolean;
  onSeeAllClick?: () => void;
}

export const PlansList: React.FC<PlansListProps> = ({ showAll = false, onSeeAllClick }) => {
  const { plans, isPurchaseInProgress, loading } = useData();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  const displayPlans = showAll ? plans : plans.slice(0, 4);

  // Show loading state only during initial load when there are no plans yet
  if (loading && plans.length === 0) {
    return (
      <div className={showAll ? 'px-4 py-6' : 'px-4 mt-6'}>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Data Plans</h3>
            {!showAll && (
              <span className="text-[#0066FF] text-sm font-medium">Loading...</span>
            )}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('daily')) return <Clock className="w-5 h-5 text-[#0066FF]" />;
    if (name.includes('weekly')) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (name.includes('monthly')) return <Package className="w-5 h-5 text-purple-600" />;
    return <Wifi className="w-5 h-5 text-[#0066FF]" />;
  };

  const getPlanColor = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('daily')) return 'bg-blue-50';
    if (name.includes('weekly')) return 'bg-green-50';
    if (name.includes('monthly')) return 'bg-purple-50';
    return 'bg-gray-50';
  };

  if (showAll) {
    // Full page view
    return (
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Choose Your Plan</h2>
            <p className="text-sm text-gray-500 mt-1">Select the perfect data plan for your needs</p>
          </div>
          
          <div className="p-4 space-y-3">
            {displayPlans.map((plan) => (
              <div 
                key={plan.id} 
                className={`p-4 rounded-xl border border-gray-100 hover:border-[#0066FF] transition-all cursor-pointer ${getPlanColor(plan.name)}`}
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getPlanColor(plan.name)}`}>
                      {getPlanIcon(plan.name)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{plan.dataAmount}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{getCorrectDurationDisplay(plan)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₦{plan.price.toLocaleString()}</p>
                    <button className="text-[#0066FF] text-xs font-medium mt-1 hover:underline">
                      Buy Now →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {selectedPlan && (
          <PurchaseModal
            plan={selectedPlan}
            onClose={() => setSelectedPlan(null)}
            disabled={isPurchaseInProgress}
          />
        )}
      </div>
    );
  }

  // Card view for dashboard
  return (
    <div className="bg-white rounded-2xl mx-4 mt-6 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Quick Buy Plans</h3>
        <button 
          onClick={onSeeAllClick}
          className="text-[#0066FF] text-sm font-medium hover:underline flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4">
        {/* Quick Buy Grid */}
        <div className="grid grid-cols-2 gap-3">
          {displayPlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getPlanColor(plan.name)}`}>
                  {getPlanIcon(plan.name)}
                </div>
                <span className="text-xs font-medium text-gray-600">{plan.dataAmount}</span>
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">₦{plan.price.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{getCorrectDurationDisplay(plan)}</p>
            </button>
          ))}
        </div>

        {/* Popular Plans Section */}
        <div className="mt-4 p-3 bg-gradient-to-r from-[#0066FF]/10 to-blue-500/10 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#0066FF]" />
              <span className="text-sm font-semibold text-gray-900">Most Popular</span>
            </div>
            <span className="text-xs text-gray-500">Save up to 20%</span>
          </div>
        </div>
      </div>

      {selectedPlan && (
        <PurchaseModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          disabled={isPurchaseInProgress}
        />
      )}
    </div>
  );
};