import React, { useState } from 'react';
import { X, CheckCircle2, Server, RefreshCw, Database, ExternalLink } from 'lucide-react';
import { getStoredCredentials, updateSupabaseCredentials } from '../lib/supabase';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({ isOpen, onClose }) => {
  const stored = getStoredCredentials();
  const [url, setUrl] = useState(stored.url);
  const [key, setKey] = useState(stored.key);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseCredentials(url, key);
    setStatusMessage('Credentials saved! Reloading configuration...');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleResetToDemo = () => {
    updateSupabaseCredentials('', '');
    setUrl('');
    setKey('');
    setStatusMessage('Reset to local store. Reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Supabase Connection</h3>
              <p className="text-xs text-slate-500">Configure backend or test with local demo store</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {stored.isConfigured ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900">Live Supabase Backend Configured</p>
                <p className="text-emerald-700 truncate">{stored.url}</p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 flex items-start gap-3">
              <Server className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sky-900">Local Sandbox Mode</p>
                <p className="text-sky-700 leading-relaxed">
                  Running with pre-loaded 888 Avenger Squadron roster, rehearsals, and sheet music.
                </p>
              </div>
            </div>
          )}

          {statusMessage && (
            <div className="p-3 rounded-xl bg-sky-100 text-sky-800 flex items-center gap-2 font-medium">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                VITE_SUPABASE_URL
              </label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://xyzproject.supabase.co"
                className="w-full px-3 py-2 font-mono bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                VITE_SUPABASE_ANON_KEY / SECRET KEY
              </label>
              <input
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="sb_secret_... or anon key"
                className="w-full px-3 py-2 font-mono bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetToDemo}
                className="px-3.5 py-2 font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Reset to Demo
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors shadow-sm"
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Row Level Security (RLS) protects cadet privacy</span>
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
            className="text-sky-600 hover:underline inline-flex items-center gap-1 font-medium"
          >
            <span>Supabase Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
