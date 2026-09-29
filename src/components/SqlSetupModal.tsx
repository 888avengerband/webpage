import React, { useState } from 'react';
import { X, Copy, Check, Download, Database, Shield, KeyRound, ExternalLink } from 'lucide-react';
import { SUPABASE_SQL_SCRIPT } from '../data/supabaseSqlScript';

interface SqlSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlSetupModal: React.FC<SqlSetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([SUPABASE_SQL_SCRIPT], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '888_avenger_supabase_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl h-[88vh] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Supabase SQL Setup Script & RLS Policies
              </h3>
              <p className="text-xs text-slate-500">
                Ready-to-run database initialization for 888 Avenger RCACS Band
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download .sql</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="px-6 py-2.5 bg-sky-50/70 border-b border-sky-100 flex flex-wrap items-center justify-between gap-3 text-xs text-sky-900 font-medium">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              6 Tables, Row Level Security Policies, Storage Bucket, and Triggers.
            </span>
          </div>
          <a
            href="https://supabase.com/dashboard/project/_/sql"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 font-bold underline"
          >
            <span>Open Supabase SQL Editor</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Code Viewport */}
        <div className="flex-1 bg-slate-50 p-4 overflow-auto">
          <pre className="font-mono text-xs text-slate-800 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
            <code>{SUPABASE_SQL_SCRIPT}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <KeyRound className="w-3.5 h-3.5 text-sky-600" />
            profiles, sheet_music, song_parts, part_assignments, attendance, excused_absences
          </span>
          <span className="text-slate-400 font-mono text-[11px]">Status: Production Ready</span>
        </div>
      </div>
    </div>
  );
};
