import React, { useEffect, useState } from 'react';
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
import { getSupabaseClient } from '../lib/supabase';

interface LoginPageProps {
  onBackToSplash: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onBackToSplash,
  onLoginSuccess,
}) => {
  const { signIn, sendPasswordResetEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      setIsResettingPassword(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isResettingPassword) {
      if (newPassword.length < 8) {
        setError('New password must be at least 8 characters.');
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('The new passwords do not match.');
        setLoading(false);
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      setLoading(false);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setNewPassword('');
      setConfirmPassword('');
      setIsResettingPassword(false);
      setResetEmailSent(false);
      setPassword('');
      onLoginSuccess();
      return;
    }

    const res = await signIn(email, password);
    setLoading(false);
    if (res.success) {
      onLoginSuccess();
    } else {
      setError(res.error || 'Invalid credentials.');
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setResetEmailSent(false);

    if (!email.trim()) {
      setError('Enter your account email first.');
      return;
    }

    setLoading(true);
    const res = await sendPasswordResetEmail(email);
    setLoading(false);

    if (res.success) {
      setResetEmailSent(true);
    } else {
      setError(res.message);
    }
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

        {/* Cadet Sign In / Password Recovery Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {resetEmailSent && !isResettingPassword && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
              Password reset instructions were sent to <strong>{email}</strong>. Check your email and follow the link to choose a new password.
            </div>
          )}
          {!isResettingPassword && (
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
                placeholder="name@cdt.cadets.gc.ca"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
              />
            </div>
          </div>
          )}

          {isResettingPassword ? (
            <>
              <div>
                <label className="block font-medium text-slate-700 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </>
          ) : (
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
          )}

          {!isResettingPassword && (
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full text-xs font-semibold text-sky-600 hover:text-sky-700 disabled:opacity-50"
            >
              Forgot password?
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? (isResettingPassword ? 'Updating password...' : 'Sending...') : isResettingPassword ? 'Set New Password' : 'Sign In to Cadet Portal'}</span>
          </button>
        </form>

        {isResettingPassword && (
          <button
            type="button"
            onClick={() => {
              setIsResettingPassword(false);
              setError(null);
              setNewPassword('');
              setConfirmPassword('');
            }}
            className="w-full mt-3 text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            Back to sign in
          </button>
        )}

        {/* Information box: No public registration */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <span>
            New cadet logins are provisioned by Band Officers and Band Seniors. If you require an account, please contact your chain of command.
          </span>
        </div>

      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-slate-400 mt-4">
        <span>888 Avenger RCACS Band · Walter Moberly Elementary · Vancouver, BC</span>
      </div>
    </div>
  );
};
