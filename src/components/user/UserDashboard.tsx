import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { WalletCard } from './WalletCard';
import { RecentTransactions } from './RecentTransactions';

import { PlansList } from './PlansList';
import { VirtualAccountPage } from './VirtualAccountPage';
import { BottomNavigation } from './BottomNavigation';
import { ReferralPage } from './ReferralPage';
import { SettingsPage } from './SettingsPage';
import { NotificationBanner } from './NotificationBanner';
import { Bell, ChevronDown, LogOut, User } from 'lucide-react';

type ActivePage = 'home' | 'plans' | 'referrals' | 'settings' | 'virtual-account';

export const UserDashboard: React.FC = () => {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const { user, refreshSession, logout } = useAuth();
  const { getUserPurchases, refreshData } = useData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isOnline, isSlow } = useNetworkStatus();

  // Remove the activation logic - we'll show recent transactions instead

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh both auth session and data
      await Promise.all([
        refreshSession(),
        refreshData()
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <div className="space-y-6">
            <NotificationBanner />
            <WalletCard onTopUpClick={() => setActivePage('virtual-account')} />
            <RecentTransactions onNavigateToHistory={() => setActivePage('settings')} />
            <PlansList onSeeAllClick={() => setActivePage('plans')} />
          </div>
        );
      case 'plans':
        return <PlansList showAll={true} />;
      case 'referrals':
        return <ReferralPage />;
      case 'settings':
        return <SettingsPage />;
      case 'virtual-account':
        return <VirtualAccountPage onBack={() => setActivePage('home')} />;
      default:
        return null;
    }
  };

  // Don't show header and bottom nav for virtual account page
  if (activePage === 'virtual-account') {
    return renderContent();
  }

  return (
    <div className="min-h-screen bg-[#0066FF]">
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
        {/* Header */}
        <div className="bg-[#0066FF] px-4 pt-12 pb-20 relative">
          {/* Status Bar Style Top */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-black/10"></div>
          
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-white text-xl font-bold">Starline Networks</h1>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium">Hello, {user?.email?.split('@')[0] || 'User'}</span>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="text-white w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Network Status Indicator */}
          {(!isOnline || isSlow) && (
            <div className="absolute top-16 left-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg z-20">
              <div className="flex items-center gap-2 text-gray-700 text-xs font-medium">
                {!isOnline ? (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span>Offline Mode</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span>Slow Connection</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        <main className="pb-24 min-h-[calc(100vh-200px)]">
          <div className="relative -mt-8 z-10">
            {renderContent()}
          </div>
        </main>
        <BottomNavigation activePage={activePage} onPageChange={setActivePage} />
      </div>
    </div>
  );
};