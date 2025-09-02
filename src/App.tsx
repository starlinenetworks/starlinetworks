import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { AuthForm } from './components/auth/AuthForm';
import { UserDashboard } from './components/user/UserDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { initPWASessionManagement, debugStorage } from './utils/pwaUtils';

// Import auth debug utilities (available in console as window.authDebug)
import './utils/authDebug';
// Import auth test utilities (available in console as window.testAuth)
import './utils/testAuth';
// Import data loading test utilities (available in console as window.testDataLoading)
import './utils/testDataLoading';
// Import stuck loading debug utility (available in console as window.debugStuckLoading)
import './utils/debugStuckLoading';
// Import data loading debug utility (available in console as window.debugDataLoading)
import './utils/debugDataLoading';
// Import Supabase data debug utility (available in console as window.supabaseDebug)
import './utils/supabaseDataDebug';

// Make PWA debug available in console
if (typeof window !== 'undefined') {
  (window as any).pwaDebug = debugStorage;
}

function AppContent() {
  const { user, authUser, isAdmin, loading, shouldShowLogin, sessionLoaded } = useAuth();

  // Show loading if session hasn't been checked yet OR if we're still loading
  if (!sessionLoaded || (loading && !authUser)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="text-gray-700 text-xl font-medium">Loading StarNetX...</div>
        </div>
      </div>
    );
  }

  // User is authenticated - show appropriate dashboard (even if profile is still loading)
  if (authUser) {
    if (isAdmin) {
      return <AdminDashboard />;
    }
    return <UserDashboard />;
  }

  // Not authenticated - show login form
  const isAdminRoute = window.location.pathname.includes('/admin');
  return <AuthForm isAdmin={isAdminRoute} />;
}

function App() {
  useEffect(() => {
    // Initialize PWA session management
    initPWASessionManagement();
    
    // Log PWA status
    console.log('PWA initialized. Debug with: window.pwaDebug()');
  }, []);

  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;