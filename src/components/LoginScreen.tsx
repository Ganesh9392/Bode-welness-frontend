import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { Eye, EyeOff, Lock, User, AlertCircle, ArrowRight, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { MANAGERS } from '../data/mockData';

export const LoginScreen: React.FC = () => {
  const { login, authNotice, clearAuthNotice } = useApp();
  const [username, setUsername] = useState('priya.sharma');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    clearAuthNotice();
    setLoading(true);

    setTimeout(() => {
      const res = login(username, password, rememberMe);
      if (!res.success) {
        setErrorMessage(res.message || 'Invalid username or password');
        setLoading(false);
      }
    }, 600);
  };

  const handleQuickLogin = (demoUser: typeof MANAGERS[0]) => {
    setUsername(demoUser.username);
    setPassword('password123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-bode-ivory flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bode-emerald/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-bode-gold/10 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-bode-border/70 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-bode-forest px-5 sm:px-8 pt-7 pb-6 text-center relative">
            <div className="flex justify-center mb-3">
              <Logo variant="full" size="md" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-bode-gold text-xs font-medium tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Branch Manager Portal</span>
            </div>
          </div>

          {/* Form */}
          <div className="p-5 sm:p-8">
            {authNotice && !errorMessage && (
              <div className="mb-6 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-xs sm:text-sm">{authNotice}</p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Authentication Failed</p>
                  <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal/80 mb-1.5">
                  Manager Username / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-bode-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. priya.sharma"
                    className="w-full pl-10 pr-4 py-2.5 bg-bode-ivory/40 border border-bode-border rounded-lg text-sm text-bode-charcoal placeholder-bode-muted focus:outline-none focus:ring-2 focus:ring-bode-forest focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-bode-charcoal/80">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-bode-emerald hover:text-bode-forest font-medium transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-bode-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-bode-ivory/40 border border-bode-border rounded-lg text-sm text-bode-charcoal placeholder-bode-muted focus:outline-none focus:ring-2 focus:ring-bode-forest focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-bode-muted hover:text-bode-charcoal transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-bode-charcoal/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-bode-border text-bode-forest focus:ring-bode-forest/30 w-4 h-4"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 px-4 rounded-lg bg-bode-forest hover:bg-bode-forestLight text-white font-medium text-sm tracking-wide shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 group disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Manager Portal</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Switcher */}
            <div className="mt-8 pt-6 border-t border-bode-border/70">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-bode-muted mb-3">
                <Sparkles className="w-3.5 h-3.5 text-bode-gold" />
                <span>Demo Accounts (Click to Autofill)</span>
              </div>
              <div className="space-y-2">
                {MANAGERS.map((mgr) => (
                  <button
                    key={mgr.id}
                    type="button"
                    onClick={() => handleQuickLogin(mgr)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition flex items-center justify-between ${
                      username === mgr.username
                        ? 'border-bode-gold bg-bode-gold/10 text-bode-forest font-medium'
                        : 'border-bode-border bg-bode-ivory/30 hover:bg-bode-ivory/80 text-bode-charcoal'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-bode-emerald" />
                        <span>{mgr.name}</span>
                        <span className="text-[10px] text-bode-muted">({mgr.username})</span>
                      </div>
                      <p className="text-[11px] text-bode-muted mt-0.5 truncate">{mgr.branchName}</p>
                    </div>
                    <span className="text-[10px] uppercase font-semibold text-bode-emerald shrink-0 ml-2">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-bode-muted mt-6">
          © {new Date().getFullYear()} BODE Wellness Spa
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-bode-border">
            <h3 className="font-serif text-lg font-semibold text-bode-forest mb-2">
              Password Reset
            </h3>
            <p className="text-xs text-bode-charcoal/80 mb-4 leading-relaxed">
              Contact the Operations Helpdesk to reset your credentials:
            </p>
            <div className="bg-bode-ivory p-3 rounded-lg text-xs space-y-1.5 text-bode-charcoal mb-5 border border-bode-border/70">
              <p><strong className="text-bode-forest">Operations Desk:</strong> +91 91212 88400</p>
              <p><strong className="text-bode-forest">Corporate Email:</strong> operations@bodewellnessspa.com</p>
              <p><strong className="text-bode-forest">Default Demo Password:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-bode-border">password123</code></p>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 px-4 bg-bode-forest hover:bg-bode-forestLight text-white text-xs font-medium rounded-lg transition"
            >
              Return to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
