import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Wifi, Smartphone, Download } from 'lucide-react';
import { secureStorage } from '../../utils/secureStorage';

interface AuthFormProps {
  isAdmin?: boolean;
}

// APK Download Section Component
const APKDownloadSection = () => {
  const handleDownload = () => {
    // Updated APK download link
    const apkUrl = "https://xgvxtnvdxqqeehjrvkwr.supabase.co/storage/v1/object/public/androidapk/StarnetX.apk";
    window.open(apkUrl, '_blank');
  };

  return (
    <div className="mb-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 shadow-sm">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Get the Mobile App</h3>
          <p className="text-gray-600 text-xs sm:text-sm mb-4">Download our Android app for the best experience</p>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="inline-flex items-center px-5 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 text-sm sm:text-base"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Download APK for Android
        </button>

        {/* iOS Coming Soon */}
        <div className="text-gray-500 text-xs sm:text-sm font-medium">
          iOS version coming soon
        </div>
      </div>
    </div>
  );
};

export const AuthForm: React.FC<AuthFormProps> = ({ isAdmin = false }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, register, adminLogin, profileLoading, authUser } = useAuth();
  
  // Load saved credentials on component mount and optionally auto-login
  React.useEffect(() => {
    const credentials = secureStorage.getCredentials();
    if (credentials && credentials.rememberMe) {
      setEmail(credentials.email);
      setPassword(credentials.password);
      setRememberMe(true);
      
      // Optional: Auto-login if credentials exist and user is not authenticated
      // Uncomment the following lines to enable auto-login
      // if (!authUser && !loading) {
      //   handleAutoLogin(credentials.email, credentials.password);
      // }
    }
  }, []);
  
  // If user is already authenticated, show a message
  React.useEffect(() => {
    if (authUser) {
      console.log('User already authenticated, should redirect from login page');
    }
  }, [authUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let success = false;
      
      if (isAdmin) {
        success = await adminLogin(email, password);
        if (!success) {
          setError('Invalid admin credentials or insufficient permissions');
        }
      } else if (isLogin) {
        const result = await login(email, password);
        success = result.success;
        if (!success) {
          setError(result.error || 'Invalid email or password. Please check your credentials and try again.');
        } else {
          // Save or clear credentials based on remember me
          secureStorage.saveCredentials(email, password, rememberMe);
        }
      } else {
        const result = await register(email, password, phone, referralCode);
        success = result.success;
        if (!success) {
          setError(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative">
      {/* Mobile-friendly container */}
      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Add APK download section at the top for non-admin users */}
        {!isAdmin && <APKDownloadSection />}
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl">
          {/* Subtle loading indicator for auth check */}
          {profileLoading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <div className="flex items-center gap-3 text-blue-700 text-sm">
                <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="font-medium">Checking authentication...</span>
              </div>
            </div>
          )}
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Wifi className="text-white" size={28} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
              {isAdmin ? 'Admin' : 'StarNetX'}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {isAdmin ? 'Admin Dashboard Access' : (isLogin ? 'Welcome back!' : 'Create your account')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              required
            />

            {!isLogin && !isAdmin && (
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={setPhone}
                placeholder="Enter your phone number (optional)"
              />
            )}

            {!isLogin && !isAdmin && (
              <Input
                label="Referral Code"
                type="text"
                value={referralCode}
                onChange={setReferralCode}
                placeholder="Enter referral code (optional)"
              />
            )}

            {isLogin && !isAdmin && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="rememberMe" className="text-gray-700 text-sm font-medium cursor-pointer hover:text-gray-900 transition-colors">
                    Remember me
                  </label>
                </div>
                {rememberMe && email && password && (
                  <div className="px-1 text-xs text-green-600 font-medium">
                    ✓ Credentials saved for quick login
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                <div className="flex items-center gap-3 text-red-700 text-sm">
                  <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed transform hover:-translate-y-1 active:translate-y-0"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                (isAdmin ? 'Admin Login' : (isLogin ? 'Sign In' : 'Sign Up'))
              )}
            </button>

            {!isAdmin && (
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200 hover:underline"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};