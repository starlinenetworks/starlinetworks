import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { PurchaseModal } from './PurchaseModal';
import { Plan } from '../../types';
import { Wifi, Clock, Zap, TrendingUp, Package, ChevronRight, Smartphone, Globe, Router, Star } from 'lucide-react';
import { getCorrectDurationDisplay } from '../../utils/planDurationHelper';

interface PlansListProps {
  showAll?: boolean;
  onSeeAllClick?: () => void;
}

export const PlansList: React.FC<PlansListProps> = ({ showAll = false, onSeeAllClick }) => {
  const { plans, isPurchaseInProgress, loading } = useData();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  const displayPlans = showAll ? plans : plans.slice(0, 3);

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

  const getServiceIcon = (index: number) => {
    const icons = [
      <Smartphone className="w-5 h-5 text-white" />,
      <Globe className="w-5 h-5 text-white" />,
      <Router className="w-5 h-5 text-white" />,
      <Wifi className="w-5 h-5 text-white" />
    ];
    return icons[index % icons.length];
  };

  const getServiceColor = (index: number) => {
    const colors = [
      'bg-[#0066FF]',
      'bg-orange-500',
      'bg-green-500',
      'bg-purple-500'
    ];
    return colors[index % colors.length];
  };

  // Helper to get proper duration display
  const getDurationDisplay = (plan: Plan) => {
    // Check if durationHours exists and is valid
    if (plan.durationHours && !isNaN(plan.durationHours)) {
      return getCorrectDurationDisplay(plan.durationHours);
    }
    // Fallback to duration string if durationHours is invalid
    return plan.duration || 'N/A';
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
            {displayPlans.map((plan, index) => (
              <div 
                key={plan.id} 
                className="p-4 rounded-xl border border-gray-200 hover:border-[#0066FF] hover:shadow-md transition-all cursor-pointer bg-white"
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getServiceColor(index)}`}>
                      <Wifi className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{plan.dataAmount}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{getDurationDisplay(plan)}</span>
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

  // Card view for dashboard - styled like the wallet app quick actions
  return (
    <div className="mt-6">
      {/* Quick Services Grid - Like the wallet app */}
      <div className="bg-white rounded-2xl mx-4 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Quick Services</h3>
          <button 
            onClick={onSeeAllClick}
            className="text-[#0066FF] text-sm font-medium hover:underline flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Services Grid - Updated with Hourly instead of Data */}
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {/* Hourly Plans */}
          <button 
            onClick={onSeeAllClick}
            className="py-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-[#0066FF] rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-gray-600 font-medium">Hourly</span>
          </button>
          
          {/* Daily Plans */}
          <button 
            onClick={onSeeAllClick}
            className="py-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-gray-600 font-medium">Daily</span>
          </button>
          
          {/* Weekly Plans */}
          <button 
            onClick={onSeeAllClick}
            className="py-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-gray-600 font-medium">Weekly</span>
          </button>
        </div>
      </div>

      {/* Popular Plans Section - Enhanced Design */}
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl mx-4 mt-4 shadow-sm overflow-hidden border border-blue-100">
        <div className="p-4 border-b border-blue-100 bg-gradient-to-r from-[#0066FF]/5 to-blue-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#0066FF]/10 rounded-lg">
                <Star className="w-5 h-5 text-[#0066FF]" fill="currentColor" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Popular Plans</h3>
            </div>
            <span className="text-xs font-medium text-[#0066FF] bg-[#0066FF]/10 px-2 py-1 rounded-full">
              Save up to 20%
            </span>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          {displayPlans.slice(0, 2).map((plan, index) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className="w-full relative overflow-hidden group"
            >
              {/* Background gradient animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0066FF]/5 to-blue-500/5 rounded-xl transform transition-transform group-hover:scale-105"></div>
              
              {/* Content */}
              <div className="relative p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 hover:border-[#0066FF] transition-all hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      index === 0 ? 'bg-gradient-to-br from-[#0066FF] to-blue-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'
                    }`}>
                      <Wifi className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{plan.dataAmount}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{getDurationDisplay(plan)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₦{plan.price.toLocaleString()}</p>
                    <span className="text-xs font-medium text-[#0066FF] group-hover:text-blue-700 transition-colors">
                      Get Now →
                    </span>
                  </div>
                </div>
                
                {/* Popular badge */}
                {index === 0 && (
                  <div className="absolute -top-1 -right-1">
                    <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      HOT
                    </span>
                  </div>
                )}
              </div>
            </button>
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
};