import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
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
    <div className="mb-6 p-6 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-xl rounded-3xl border border-emerald-400/30 shadow-xl">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Get the Mobile App</h3>
          <p className="text-white/80 text-sm mb-4">Download our Android app for the best experience</p>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 transform hover:-translate-y-1"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download APK for Android
        </button>

        {/* iOS Coming Soon */}
        <div className="text-white/60 text-sm font-medium">
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
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        {/* Add APK download section at the top for non-admin users */}
        {!isAdmin && <APKDownloadSection />}
        
        {/* Mobile Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-between text-white mb-4">
            {!isLogin && (
              <button
                onClick={() => setIsLogin(true)}
                className="p-2"
                type="button"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <div className="flex-1">
              {isLogin && (
                <div className="flex justify-between items-center px-2">
                  <span className="text-sm opacity-80">Don't have an account?</span>
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full"
                    type="button"
                  >
                    Get Started
                  </button>
                </div>
              )}
              {!isLogin && (
                <div className="flex justify-between items-center px-2">
                  <span className="text-sm opacity-80">Already have an account?</span>
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full"
                    type="button"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
            <div className="w-10">{/* Spacer */}</div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isAdmin ? 'Admin' : 'Jobsly'}
          </h1>
        </div>

        <div className="bg-white rounded-t-3xl p-8 min-h-[500px]">
          {/* Subtle loading indicator for auth check */}
          {profileLoading && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-2xl">
              <div className="flex items-center gap-3 text-purple-700 text-sm">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-purple-700 rounded-full animate-spin"></div>
                <span className="font-medium">Checking authentication...</span>
              </div>
            </div>
          )}
          
          {isLogin ? (
            // Login Form
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isAdmin ? 'Admin Access' : 'Welcome Back'}
                </h2>
                <p className="text-gray-600">
                  Enter your details below
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nicholas@ergemia.com"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••••••"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {isLogin && !isAdmin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
                        Remember me
                      </label>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 text-red-700 text-sm">
                      <span className="font-medium">{error}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Please wait...</span>
                    </div>
                  ) : (
                    (isAdmin ? 'Admin Login' : 'Sign In')
                  )}
                </button>

                {!isAdmin && (
                  <>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">Or sign in with</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="text-gray-700 font-medium">Google</span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span className="text-gray-700 font-medium">Facebook</span>
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>

          ) : (
            // Signup Form
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Get started free.
                </h2>
                <p className="text-gray-600">
                  Free forever. No credit card needed.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nicholas@ergemia.com"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Nicholas"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ergemia"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••••••"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1">
                      <div className={`h-1 rounded-full transition-all ${
                        password.length > 8 ? 'bg-green-500 w-full' : 
                        password.length > 4 ? 'bg-yellow-500 w-2/3' : 
                        password.length > 0 ? 'bg-red-500 w-1/3' : 'w-0'
                      }`}></div>
                    </div>
                    <span className="text-xs text-gray-500">Strong</span>
                  </div>
                </div>

                {!isAdmin && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Referral Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        placeholder="Enter referral code"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 text-red-700 text-sm">
                      <span className="font-medium">{error}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Please wait...</span>
                    </div>
                  ) : (
                    'Sign up'
                  )}
                </button>

                {!isAdmin && (
                  <>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">Or sign up with</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="text-gray-700 font-medium">Google</span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span className="text-gray-700 font-medium">Facebook</span>
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};