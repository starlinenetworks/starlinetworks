import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Eye, EyeOff, Wallet, ArrowRight, Copy, CheckCircle } from 'lucide-react';

interface WalletCardProps {
  onTopUpClick?: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ onTopUpClick }) => {
  const { user, authUser } = useAuth();
  const [showBalance, setShowBalance] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

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
  const hasVirtualAccount = user?.virtualAccountNumber && user?.virtualAccountBankName;
  const accountNumber = user?.virtualAccountNumber || null;

  const handleCopyAccount = () => {
    if (accountNumber) {
      navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm mx-4 overflow-hidden">
      {/* Savings Label */}
      <div className="bg-[#0066FF] text-white text-center py-2 text-xs font-semibold tracking-wider">
        SAVINGS WALLET
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

        {/* Account Number or Create Wallet Prompt */}
        {hasVirtualAccount ? (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Account Number</span>
              <span className="text-xs text-gray-400">{user.virtualAccountBankName}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <span className="font-mono font-semibold text-gray-900 text-lg flex-1">
                {accountNumber}
              </span>
              <button 
                onClick={handleCopyAccount}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copy account number"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-[#0066FF]" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Fund this account to top up your wallet balance
            </p>
          </div>
        ) : (
          <div className="mb-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  No Virtual Account Yet
                </h4>
                <p className="text-xs text-gray-600 mb-3">
                  Create a virtual account to easily fund your wallet and enjoy seamless transactions.
                </p>
                <button
                  onClick={onTopUpClick}
                  className="flex items-center gap-2 text-[#0066FF] text-sm font-medium hover:underline"
                >
                  Create Virtual Account
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Account Card */}
      <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-[#0066FF] to-blue-600 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              {hasVirtualAccount ? (
                <>
                  <p className="text-white font-semibold text-sm">Quick Top Up</p>
                  <p className="text-white/80 text-xs">Fund your wallet instantly</p>
                </>
              ) : (
                <>
                  <p className="text-white font-semibold text-sm">Upgrade Account</p>
                  <p className="text-white/80 text-xs">Create a virtual account to enjoy higher limits</p>
                </>
              )}
            </div>
          </div>
          <button 
            onClick={onTopUpClick}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};