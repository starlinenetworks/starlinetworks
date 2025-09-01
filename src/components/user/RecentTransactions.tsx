import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Clock, Wifi, ArrowUpRight, ArrowDownLeft, MoreVertical } from 'lucide-react';

interface RecentTransactionsProps {
  onNavigateToHistory?: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ onNavigateToHistory }) => {
  const { user } = useAuth();
  const { getUserPurchases, plans } = useData();

  const userPurchases = getUserPurchases(user?.id || '');
  
  // Get last 3 transactions, sorted by newest first
  const recentTransactions = userPurchases
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 3);

  const getTransactionIcon = (type: string) => {
    if (type === 'credit' || type === 'top-up') {
      return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
    }
    return <ArrowUpRight className="w-5 h-5 text-red-600" />;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (recentTransactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 mx-4 mt-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <button 
            onClick={onNavigateToHistory}
            className="text-[#0066FF] text-sm font-medium"
          >
            See all
          </button>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No transactions yet</p>
          <p className="text-gray-400 text-xs mt-1">Your transaction history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl mx-4 mt-6 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <button 
          onClick={onNavigateToHistory}
          className="text-[#0066FF] text-sm font-medium hover:underline"
        >
          See all
        </button>
      </div>
      
      <div className="divide-y divide-gray-50">
        {recentTransactions.map((transaction) => {
          const plan = plans.find(p => p.id === transaction.planId);
          const transactionDate = new Date(transaction.purchaseDate);
          const isCredit = transaction.type === 'top-up' || transaction.type === 'credit';
          
          return (
            <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCredit ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {getTransactionIcon(transaction.type)}
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {plan?.name || transaction.description || 'Data Purchase'}
                    </p>
                    <p className={`text-sm font-semibold ${
                      isCredit ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {isCredit ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {transaction.status === 'completed' ? 'Successful' : 
                       transaction.status === 'pending' ? 'Processing' : 
                       'Failed'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(transactionDate)}
                    </p>
                  </div>
                </div>
                
                {/* More Options */}
                <button className="p-1 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};