import React, { useEffect, useState } from 'react';
import { ArrowLeft, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SquadronCrest } from './SquadronCrest';

interface Props { onBackToLogin: () => void; }

export const ForgotPasswordPage: React.FC<Props> = ({ onBackToLogin }) => {
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !isSupabaseConfigured()) return;
    const { data } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true);
    });
    if (window.location.hash.includes('access_token=')) setRecoveryMode(true);
    return () => data.subscription.unsubscribe();
  }, []);

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');
    setLoading(true);
    const result = await sendPasswordResetEmail(email);
    setLoading(false);
    if (result.success) setMessage(result.message);
    else setError(result.message);
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (newPassword.length < 8) return setError('Password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    const supabase = getSupabaseClient();
    if (!supabase) return setError('Supabase is not configured.');
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (updateError) return setError(updateError.message);
    setMessage('Your password has been updated. You can now sign in.');
    setNewPassword(''); setConfirmPassword(''); setRecoveryMode(false);
    window.history.replaceState({}, '', '/login');
  };

  return (
    <div className="min-h-screen bg-sky-50/50 flex flex-col justify-between p-4 sm:p-6 font-body">
      <div className="max-w-md w-full mx-auto">
        <button onClick={onBackToLogin} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /><span>Back to Login</span>
        </button>
      </div>
      <div className="max-w-md w-full mx-auto my-auto bg-white rounded-2xl border border-sky-100 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <SquadronCrest size="md" />
          <h2 className="font-heading text-2xl font-black text-slate-900 mt-3 tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-1">888 Avenger Band Portal</p>
        </div>
        {error && <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}
        {message && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" /><span>{message}</span></div>}
        {!recoveryMode ? (
          <form onSubmit={sendReset} className="space-y-4">
            <label className="block text-xs font-medium text-slate-700">Account Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@cdt.cadets.gc.ca" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl font-mono" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs disabled:opacity-50">{loading ? 'Sending...' : 'Send Reset Instructions'}</button>
          </form>
        ) : (
          <form onSubmit={updatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
              <input type="password" required minLength={8} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input type="password" required minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs disabled:opacity-50">{loading ? 'Updating...' : 'Update Password'}</button>
          </form>
        )}
      </div>
      <div className="text-center text-xs text-slate-400 mt-4">888 Avenger RCACS Band · Walter Moberly Elementary · Vancouver, BC</div>
    </div>
  );
};
