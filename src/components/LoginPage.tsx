import React, { useState } from 'react';
import {
  ArrowLeft,
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SquadronCrest } from './SquadronCrest';

interface LoginPageProps {
  onBackToSplash: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onBackToSplash,
  onLoginSuccess,
}) => {
  const { signIn, switchMockProfile } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn(email, password);
    setLoading(false);
    if (res.success) {
      onLoginSuccess();
    } else {
      setError(res.error || 'Invalid credentials.');
    }
  };

  const handleQuickDemo = (profileId: string) => {
    switchMockProfile(profileId);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-sky-50/50 flex flex-col justify-between p-4 sm:p-6 font-body">
      {/* Top back button */}
      <div className="max-w-md w-full mx-auto">
        <button
          onClick={onBackToSplash}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Splash</span>
        </button>
      </div>

      {/* Centered Login Card */}
      <div className="max-w-md w-full mx-auto my-auto bg-white rounded-2xl border border-sky-100 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <SquadronCrest size="md" />
          <h2 className="font-heading text-2xl font-black text-slate-900 mt-3 tracking-tight">
            <span className="font-squadron-num text-sky-600 font-black mr-1">888</span>
            Avenger Band Portal
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Phantom Flight · Member Authentication · Vancouver, BC
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Cadet Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Cadet365 / Account Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="NPark123@cdt.cadets.gc.ca or bob.ross@cadets.gc.ca"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Signing in...' : 'Sign In to Cadet Portal'}</span>
          </button>
        </form>

        {/* Information box: No public registration */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <span>
            New cadet profiles and music locker access are provisioned by Band Officers and Band Seniors. If you require an account, please contact your Band Senior.
          </span>
        </div>

        {/* 1-Click Quick Demo Sign In */}
        <div className="mt-6 pt-5 border-t border-sky-100">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
            Fast 1-Click Access (Testing Personas)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickDemo('u-admin-02')}
              className="p-2.5 rounded-xl bg-sky-50/80 hover:bg-sky-100 border border-sky-200 text-left transition-colors"
            >
              <p className="font-bold text-slate-900">WO2 Ethan Chen</p>
              <p className="text-[11px] text-sky-700 font-mono font-medium">Role: Admin (Officer / Band Senior)</p>
            </button>

            <button
              onClick={() => handleQuickDemo('u-member-01')}
              className="p-2.5 rounded-xl bg-white hover:bg-sky-50/50 border border-slate-200 text-left transition-colors"
            >
              <p className="font-bold text-slate-900">FSgt Tremblay</p>
              <p className="text-[11px] text-slate-600 font-mono font-medium">Role: Cadet Musician (Flute)</p>
            </button>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-slate-400 mt-4">
        <span>888 Avenger RCACS Band · Walter Moberly Elementary · Vancouver, BC</span>
      </div>
    </div>
  );
};
