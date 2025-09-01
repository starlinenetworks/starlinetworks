import React from 'react';
import { Home, Wifi, Users, Settings, CreditCard, BarChart3, Grid3x3 } from 'lucide-react';

type ActivePage = 'home' | 'plans' | 'referrals' | 'settings';

interface BottomNavigationProps {
  activePage: ActivePage;
  onPageChange: (page: ActivePage) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activePage,
  onPageChange,
}) => {
  const navItems = [
    { id: 'home' as ActivePage, icon: Home, label: 'Home' },
    { id: 'plans' as ActivePage, icon: Grid3x3, label: 'Plans' },
    { id: 'referrals' as ActivePage, icon: Users, label: 'Referral' },
    { id: 'settings' as ActivePage, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-4 flex-1 transition-all ${
                  isActive
                    ? 'text-[#0066FF]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon 
                  size={24} 
                  className={`mb-1 ${isActive ? 'stroke-2' : ''}`}
                />
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};