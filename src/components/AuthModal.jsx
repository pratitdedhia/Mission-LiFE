import React, { useState } from 'react';
import { X, Lock, Mail, User, MapPin, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { loginWithEmail, registerWithEmail, loginAsGuest } from '../services/authService';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [district, setDistrict] = useState('Ahmedabad');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let res;
    if (mode === 'login') {
      res = await loginWithEmail(email, password);
    } else {
      res = await registerWithEmail(email, password, displayName, district);
    }

    setLoading(false);
    if (res.success) {
      onAuthSuccess(res.user);
      onClose();
    } else {
      setError(res.error || "Authentication failed. Please verify credentials.");
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    setError(null);
    const res = await loginAsGuest();
    setLoading(false);
    if (res.success) {
      onAuthSuccess(res.user);
      onClose();
    }
  };

  const GUJARAT_DISTRICTS = [
    "Ahmedabad", "Gandhinagar", "Surat", "Vadodara", "Rajkot", 
    "Bhavnagar", "Jamnagar", "Junagadh", "Kutch", "Anand", "Bharuch"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#121316] border border-[#26282f] rounded-2xl p-6 sm:p-7 shadow-2xl">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100">
            {mode === 'login' ? 'Welcome Back to Mission LiFE' : 'Join Gujarat Mission LiFE'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'login' 
              ? 'Sign in to sync your carbon score and green micro-tasks' 
              : 'Create your citizen profile & start logging verified climate actions'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pooja Patel"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Gujarat District</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {GUJARAT_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="citizen@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#18191d] border border-[#2a2c33] rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            <span>{loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Or continue with</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Quick Guest / Demo */}
        <button
          onClick={handleGuest}
          disabled={loading}
          type="button"
          className="w-full py-2 px-3 bg-[#17181c] hover:bg-[#1f2025] border border-[#26282e] text-zinc-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Continue with 1-Click Guest Demo</span>
        </button>

        {/* Switch Mode */}
        <div className="mt-5 text-center text-xs text-zinc-400">
          {mode === 'login' ? (
            <p>
              New citizen?{' '}
              <button 
                type="button"
                onClick={() => setMode('signup')} 
                className="text-emerald-400 font-semibold hover:underline cursor-pointer"
              >
                Register now
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button 
                type="button"
                onClick={() => setMode('login')} 
                className="text-emerald-400 font-semibold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
