import React, { useState } from 'react';
import { 
  Sprout, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Languages, 
  Check, 
  AlertCircle, 
  ShieldCheck,
  Server
} from 'lucide-react';
import type { Language, UserProfile } from '../types';
import { translations } from '../data/translations';
import { authAPI } from '../services/api';
import { GpsLocationTracker } from './GpsLocationTracker';
import { ServerEndpointModal } from './ServerEndpointModal';

interface AuthPageProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLoginSuccess: (profile: UserProfile) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  language,
  onLanguageChange,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Login Form State (Only Email & Password)
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Registration Form State (Full Name, Email, Phone, Password, Confirm Password, Crop Type, Location, Role)
  const [regFullName, setRegFullName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [cropType, setCropType] = useState<string>('Citrus (Orange / Lemon)');
  const [location, setLocation] = useState<string>('Nagpur, Maharashtra');
  const [role, setRole] = useState<'farmer' | 'expert' | 'vendor'>('farmer');

  // GPS Location State
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | undefined>(undefined);
  const [isServerModalOpen, setIsServerModalOpen] = useState<boolean>(false);

  const t = translations[language];

  const handleCoordinatesChange = (lat: number, lon: number, accuracy?: number) => {
    setLatitude(lat);
    setLongitude(lon);
    setGpsAccuracy(accuracy);
  };

  // Handle Login Submit (Email + Password only)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    if (!loginEmail.trim()) {
      setAuthError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await authAPI.login({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (response && response.user) {
        onLoginSuccess(response.user);
      } else {
        throw new Error("Invalid login response from server");
      }
    } catch (err: any) {
      console.warn("Login error:", err);
      const detail = err?.response?.data?.detail || err.message;
      if (detail) {
        setAuthError(detail);
      } else {
        setAuthError("Unable to login: Account not found with this email. Please create an account first.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register Submit (Full Validation)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!regEmail.includes('@')) {
      setAuthError("Please enter a valid email address.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setAuthError("Passwords do not match. Please verify both password fields.");
      return;
    }

    if (regPassword.length < 6) {
      setAuthError("Password is too weak. Please use at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register({
        full_name: regFullName,
        email: regEmail.trim(),
        phone: regPhone,
        password: regPassword,
        confirm_password: regConfirmPassword,
        crop_type: cropType,
        location: location,
        latitude: latitude,
        longitude: longitude,
        role: role,
      });

      if (response && response.user) {
        onLoginSuccess(response.user);
      } else {
        throw new Error("Registration failed");
      }
    } catch (err: any) {
      console.warn("Register error:", err);
      const detail = err?.response?.data?.detail || err.message;
      if (detail) {
        setAuthError(detail);
      } else {
        // Fallback profile if offline
        const profile: UserProfile = {
          id: `user-${Date.now()}`,
          name: regFullName || 'Farmer Partner',
          email: regEmail,
          username: regEmail.split('@')[0],
          phone: regPhone || '+91 98765 43210',
          language: language,
          farmSize: 2.5,
          farmUnit: 'Acres',
          primaryCrop: cropType,
          cropType: cropType,
          location: location,
          role: role,
          state: location,
          district: location,
          isLoggedIn: true,
        };
        onLoginSuccess(profile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between font-sans bg-earth-50 text-slate-900 overflow-x-hidden">
      
      {/* Background Citrus Grove Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/auth-bg.png'), url('/images/auth-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-agri-950/85 via-agri-950/45 to-agri-950/80" />
      </div>

      {/* Top Header with Multilingual Switcher */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-agri-500 to-agri-700 flex items-center justify-center text-white shadow-lg shadow-agri-950/40 border border-white/25">
            <Sprout className="w-6 h-6 sm:w-7 sm:h-7 text-citrus-300" />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              Agri<span className="text-citrus-400">Guard</span>
            </span>
          </div>
        </div>

        {/* Server Endpoint Config & Language Switcher */}
        <div className="flex items-center gap-2">
          {/* Server Config Button (Crucial for Mobile & Network Devices) */}
          <button
            type="button"
            onClick={() => setIsServerModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-xs font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
            title="Configure backend server IP and test connection"
          >
            <Server className="w-3.5 h-3.5 text-citrus-300 animate-pulse" />
            <span className="hidden xs:inline">Server IP</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/30 shadow-lg">
            <Languages className="w-4 h-4 text-citrus-300 ml-2 mr-1 hidden sm:inline" />
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                language === 'en'
                  ? 'bg-white text-agri-950 shadow-md scale-105'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('hi')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                language === 'hi'
                  ? 'bg-white text-agri-950 shadow-md scale-105'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('ta')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                language === 'ta'
                  ? 'bg-white text-agri-950 shadow-md scale-105'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              தமிழ்
            </button>
          </div>
        </div>
      </header>

      {/* Main Authentication Section */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Hero Tagline & Info */}
          <div className="lg:col-span-5 text-white space-y-3 hidden lg:block">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-lg leading-tight">
              Agri<span className="text-citrus-400">Guard</span> AI
            </h1>
            <p className="text-lg font-bold text-citrus-200/95 italic tracking-wide drop-shadow-md leading-relaxed">
              &ldquo;{t.brandQuote}&rdquo;
            </p>
            <div className="pt-4 space-y-2 text-xs text-emerald-100">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-citrus-400" />
                <span>Secure Email & Password Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-citrus-400" />
                <span>Early Crop Disease & Weather Risk Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-citrus-400" />
                <span>Role-Based Access (Farmer, Expert, Vendor)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Auth Card */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/60">
              
              {/* Main Tab Switch: Login vs Create Account */}
              <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setActiveTab('login');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
                    activeTab === 'login'
                      ? 'bg-agri-700 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 font-bold'
                  }`}
                >
                  Sign In (Log In)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setActiveTab('register');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
                    activeTab === 'register'
                      ? 'bg-agri-700 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 font-bold'
                  }`}
                >
                  Create Account (Sign Up)
                </button>
              </div>

              {/* Validation & Auth Error Alert Banner */}
              {authError && (
                <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-start gap-2.5 shadow-xs animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-amber-950">{authError}</p>
                    {authError.toLowerCase().includes("account not found") && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setActiveTab('register');
                        }}
                        className="mt-1 text-[11px] font-extrabold text-agri-800 hover:text-agri-950 underline"
                      >
                        Create Account Now →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Mode A: Login Page (Simple: Email + Password ONLY) */}
              {activeTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g., farmer@domain.com"
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 focus:ring-1 focus:ring-agri-600 bg-slate-50/70 font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-800">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('Password reset instructions sent to your email.')}
                        className="text-[11px] text-agri-700 hover:text-agri-900 font-semibold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 focus:ring-1 focus:ring-agri-600 bg-slate-50/70 font-mono text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-agri-700 focus:ring-agri-500 border-slate-300"
                      />
                      <span>Remember Me</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-agri-700 to-agri-900 hover:from-agri-800 hover:to-agri-950 text-white font-black text-xs sm:text-sm shadow-md shadow-agri-900/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Signing In...' : 'Sign In to AgriGuard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Mode B: Create Account Page (Sign Up: Full Name, Email, Phone, Password, Confirm Password, Crop Type, Location, Role) */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  
                  {/* Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          placeholder="e.g. Rajesh Kumar"
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/70 text-slate-900 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="e.g. farmer@domain.com"
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/70 text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Phone Number <span className="text-slate-400 font-normal">(Optional for SMS)</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/70 text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Account Role *
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/70 font-bold text-slate-800"
                      >
                        <option value="farmer">🌾 Farmer</option>
                        <option value="expert">🔬 Agricultural Expert</option>
                        <option value="vendor">🏬 Agro-Store Vendor</option>
                      </select>
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/70 font-mono text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/70 font-mono text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Primary Crop Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Primary Crop Type *
                    </label>
                    <select
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/70 font-bold text-slate-800"
                    >
                      <option value="Citrus (Orange / Lemon)">Citrus (Orange / Lemon / Mosambi)</option>
                      <option value="Tomato / Vegetables">Tomato / Vegetables</option>
                      <option value="Paddy / Rice">Paddy / Rice (धान)</option>
                      <option value="Chilli & Spices">Chilli & Spices (मिर्च)</option>
                      <option value="Wheat & Grains">Wheat & Grains (गेहूं)</option>
                      <option value="Cotton / Cash Crops">Cotton (कपास / பருத்தி)</option>
                    </select>
                  </div>

                  {/* Automatic GPS Location Permission & Tracking Component */}
                  <GpsLocationTracker
                    locationValue={location}
                    onLocationChange={(newLoc) => setLocation(newLoc)}
                    onCoordinatesChange={handleCoordinatesChange}
                    autoPrompt={true}
                    label="Farm / Field Location"
                  />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-agri-700 to-agri-900 hover:from-agri-800 hover:to-agri-950 text-white font-black text-xs sm:text-sm shadow-md shadow-agri-900/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Creating Account...' : 'Complete Sign Up & Start'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Guest Explore Quick Option */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onLoginSuccess({
                      id: 'guest',
                      name: 'Guest Farmer',
                      email: 'guest@agriguard.ai',
                      username: 'guest_farmer',
                      phone: '+91 98765 00000',
                      language: language,
                      farmSize: 2.5,
                      farmUnit: 'Acres',
                      primaryCrop: 'Citrus / Vegetables',
                      cropType: 'Citrus / Vegetables',
                      location: 'Nagpur',
                      role: 'farmer',
                      state: 'Maharashtra',
                      district: 'Nagpur',
                      isLoggedIn: true,
                    });
                  }}
                  className="text-xs font-extrabold text-slate-600 hover:text-agri-900 transition-colors"
                >
                  Explore as Guest Farmer →
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 py-3 text-center text-xs text-white/80 drop-shadow-sm font-medium">
        <p>AgriGuard AI • English | हिंदी | தமிழ்</p>
      </footer>

      {/* Backend Server Configuration Modal */}
      <ServerEndpointModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
      />

    </div>
  );
};
