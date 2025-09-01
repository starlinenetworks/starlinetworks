import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Eye, EyeOff } from 'lucide-react';

interface WalletCardProps {
  onTopUpClick?: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ onTopUpClick }) => {
  const { user, authUser } = useAuth();
  const [showBalance, setShowBalance] = React.useState(true);

  // Show skeleton while user data is loading
  if (!user && authUser) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm mx-4 animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  // Don't show anything if not authenticated
  if (!user) {
    return null;
  }

  const balance = user?.walletBalance || 0;
  const accountNumber = user?.id ? `00${user.id.slice(-8).toUpperCase()}` : '0011527716';

  return (
    <div className="bg-white rounded-2xl shadow-sm mx-4 overflow-hidden">
      {/* Savings Label */}
      <div className="bg-[#0066FF] text-white text-center py-2 text-xs font-semibold tracking-wider">
        SAVINGS
      </div>
      
      <div className="p-6">
        {/* Available Balance Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Available Balance</span>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showBalance ? (
                <Eye className="w-5 h-5 text-gray-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">₦</span>
            <span className="text-3xl font-bold text-gray-900">
              {showBalance 
                ? balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '***,***.**'
              }
            </span>
          </div>
        </div>

        {/* Account Number */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Account Number:</span>
          <span className="font-semibold text-gray-700">{accountNumber}</span>
          <button className="ml-auto">
            <svg className="w-4 h-4 text-[#0066FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 border-t border-gray-100">
        <button 
          onClick={onTopUpClick}
          className="py-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors border-r border-gray-100"
        >
          <div className="w-10 h-10 bg-[#0066FF] rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </div>
          <span className="text-xs text-gray-600 font-medium">Transfer</span>
        </button>
        
        <button className="py-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors border-r border-gray-100">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xs text-gray-600 font-medium">Airtime</span>
        </button>
        
        <button className="py-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-xs text-gray-600 font-medium">Bills</span>
        </button>
      </div>

      {/* Upgrade Account Card */}
      <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-[#0066FF] to-blue-600 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Upgrade Account</p>
            <p className="text-white/80 text-xs">Upgrade your savings account to enjoy higher limits</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};