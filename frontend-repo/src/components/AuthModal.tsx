import React, { useState } from 'react';
import { 
  Sprout, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail,
  User as UserIcon, 
  Phone, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  X,
  AlertCircle,
  Check
} from 'lucide-react';
import { Language, UserProfile } from '../types';
import { translations } from '../data/translations';
import { authAPI } from '../services/api';
import { GpsLocationTracker } from './GpsLocationTracker';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
  language: Language;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  language,
  initialMode = 'login',
}) => {
  const [isLoginMode, setIsLoginMode] = useState<boolean>(initialMode === 'login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Login State (Email & Password Only)
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Sign Up State
  const [fullName, setFullName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [cropType, setCropType] = useState<string>('Citrus (Orange / Lemon)');
  const [location, setLocation] = useState<string>('Nagpur, Maharashtra');
  const [role, setRole] = useState<'farmer' | 'expert' | 'vendor'>('farmer');

  // GPS Location State
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  const t = translations[language];

  const handleCoordinatesChange = (lat: number, lon: number) => {
    setLatitude(lat);
    setLongitude(lon);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (isLoginMode) {
      if (!loginEmail.trim()) {
        setAuthError("Please enter your email address.");
        return;
      }
      setIsLoading(true);
      try {
        const response = await authAPI.login({
          email: loginEmail.trim(),
          password: loginPassword,
        });

        if (response && response.user) {
          onLoginSuccess(response.user);
          onClose();
        }
      } catch (err: any) {
        console.warn("Modal login error:", err);
        const detail = err?.response?.data?.detail || err.message;
        setAuthError(detail || "Unable to login: Account not found with this email. Please create an account first.");
      } finally {
        setIsLoading(false);
      }
    } else {
      if (regPassword !== confirmPassword) {
        setAuthError("Passwords do not match. Please verify your password.");
        return;
      }

      if (regPassword.length < 6) {
        setAuthError("Password is too weak. Please use at least 6 characters.");
        return;
      }

      setIsLoading(true);
      try {
        const response = await authAPI.register({
          full_name: fullName,
          email: regEmail.trim(),
          phone: phone,
          password: regPassword,
          confirm_password: confirmPassword,
          crop_type: cropType,
          location: location,
          latitude: latitude,
          longitude: longitude,
          role: role,
        });

        if (response && response.user) {
          onLoginSuccess(response.user);
          onClose();
        }
      } catch (err: any) {
        console.warn("Modal register error:", err);
        const detail = err?.response?.data?.detail || err.message;
        setAuthError(detail || "Registration failed. Please check your inputs.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col md:flex-row max-h-[92vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-md transition-all hover:scale-105"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Info Column */}
        <div className="relative md:w-5/12 bg-agri-900 text-white p-6 sm:p-8 flex flex-col justify-between overflow-hidden shrink-0">
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/auth-bg.png" 
              alt="AgriGuard Grove" 
              className="w-full h-full object-cover opacity-60 scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/auth-bg.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-agri-950 via-agri-900/80 to-agri-900/40" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-citrus-300 mb-4">
              <Sprout className="w-4 h-4 text-citrus-400" />
              <span>AgriGuard AI Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Smart Agriculture & Precision Health
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-agri-100/90 leading-relaxed font-medium">
              Access localized disease diagnosis, acreage dosage calculations, and weather advisories.
            </p>
          </div>

          <div className="relative z-10 mt-6 space-y-2 text-xs text-agri-100">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
              <ShieldCheck className="w-4 h-4 text-citrus-400 shrink-0" />
              <span>Secure Encrypted Password Hashing</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
              <Sparkles className="w-4 h-4 text-citrus-400 shrink-0" />
              <span>Personalized Weather API Integration</span>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="md:w-7/12 p-6 sm:p-8 overflow-y-auto bg-white flex flex-col justify-between">
          <div>
            {/* Mode Switcher */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setIsLoginMode(true);
                  }}
                  className={`pb-2 text-sm sm:text-base font-bold transition-colors relative ${
                    isLoginMode 
                      ? 'text-agri-800 border-b-2 border-agri-700' 
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  Sign In (Log In)
                </button>
                <span className="text-slate-300 px-1">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setIsLoginMode(false);
                  }}
                  className={`pb-2 text-sm sm:text-base font-bold transition-colors relative ${
                    !isLoginMode 
                      ? 'text-agri-800 border-b-2 border-agri-700' 
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                >
                  Create Account (Sign Up)
                </button>
              </div>
            </div>

            {/* Error Message Banner */}
            {authError && (
              <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-start gap-2.5 shadow-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-amber-950">{authError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* LOGIN MODE: Email + Password Only */}
              {isLoginMode ? (
                <>
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
                        placeholder="e.g. farmer@domain.com"
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-800">
                        Password *
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/50 font-mono"
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
                </>
              ) : (
                /* SIGN UP MODE: Full Name, Email, Phone, Password, Confirm Password, Crop Type, Location, Role */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rajesh Kumar"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. farmer@domain.com"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Role *
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50 font-bold"
                      >
                        <option value="farmer">🌾 Farmer</option>
                        <option value="expert">🔬 Expert</option>
                        <option value="vendor">🏬 Vendor</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Password *
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50/50 font-mono"
                      />
                    </div>
                  </div>

                  {/* Crop Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Primary Crop Type
                    </label>
                    <select
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50 font-bold"
                    >
                      <option value="Citrus (Orange / Lemon)">Citrus (Orange / Lemon)</option>
                      <option value="Tomato / Vegetables">Tomato / Vegetables</option>
                      <option value="Paddy / Rice">Paddy / Rice</option>
                      <option value="Wheat & Grains">Wheat & Grains</option>
                      <option value="Cotton / Cash Crops">Cotton (कपास / பருத்தி)</option>
                    </select>
                  </div>

                  {/* GPS Tracking & Location Component */}
                  <GpsLocationTracker
                    locationValue={location}
                    onLocationChange={(newLoc) => setLocation(newLoc)}
                    onCoordinatesChange={handleCoordinatesChange}
                    autoPrompt={!isLoginMode}
                    label="Farm / Field Location"
                  />
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-agri-700 to-agri-800 hover:from-agri-800 hover:to-agri-900 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{isLoading ? 'Processing...' : isLoginMode ? 'Sign In' : 'Complete Sign Up'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthError(null);
                setIsLoginMode(!isLoginMode);
              }}
              className="text-agri-800 hover:text-agri-950 font-bold hover:underline"
            >
              {isLoginMode ? 'Need an account? Sign Up' : 'Already registered? Sign In'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
