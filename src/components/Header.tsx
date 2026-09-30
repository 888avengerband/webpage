import React, { useState } from 'react';
import {
  Shield,
  Music,
  Database,
  Settings,
  LogOut,
  ChevronDown,
  MapPin,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SquadronCrest } from './SquadronCrest';

interface HeaderProps {
  currentTab: 'landing' | 'member' | 'admin';
  setCurrentTab: (tab: 'landing' | 'member' | 'admin') => void;
  onOpenSqlModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSqlModal,
  onOpenSettingsModal,
  onOpenAuthModal,
}) => {
  const { profile, role, signOut } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full shadow-2xl">
      {/* Top Cadet Info Ribbon (matching 888aircadets.ca top-bar) */}
      <div className="bg-[#051021] border-b border-blue-900/40 text-[11px] text-slate-300 py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-amber-300 font-mono font-bold tracking-wide">
              <span className="inline-block w-2 h-2 rounded-full bg-red-600 shadow-sm mr-0.5"></span>
              888 AVENGER RCACS · ROYAL CANADIAN AIR CADETS
            </span>
            <span className="hidden md:inline text-blue-900">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Walter Moberly Elementary · 1000 E 59th Ave, Vancouver, BC V5X 1Y7</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden sm:flex items-center gap-1 text-slate-300">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Parade: 18:30 – 21:15 hrs · Band: 18:30 – 21:00 hrs</span>
            </span>
            <span className="text-blue-900 hidden sm:inline">|</span>
            <a
              href="http://888aircadets.ca/"
              target="_blank"
              rel="noreferrer"
              className="text-amber-300 hover:text-amber-200 font-mono inline-flex items-center gap-1 font-bold transition-colors"
            >
              <span>888aircadets.ca</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Squadron Navigation Bar in Authentic RCAF Navy */}
      <div className="bg-[#0A1E3F] border-b-2 border-[#D4AF37] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Zone 1: Pure Vector Squadron Crest & Wordmark */}
          <div className="flex items-center gap-3.5 shrink-0">
            <button
              onClick={() => setCurrentTab('landing')}
              className="flex items-center gap-3 text-left focus:outline-none group py-1"
            >
              <div className="p-0.5 rounded-full group-hover:scale-105 transition-transform duration-200">
                <SquadronCrest size="md" />
              </div>
              <div>
                <span className="font-heading text-lg font-black tracking-tight text-white group-hover:text-amber-300 transition-colors whitespace-nowrap block leading-tight">
                  <span className="font-squadron-num text-amber-300 font-black mr-1">888</span>
                  Avenger Squadron
                </span>
                <span className="text-[11px] text-amber-300 font-mono tracking-wider uppercase font-semibold block">
                  Phantom Flight · Vancouver, BC
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Crisp Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold tracking-wide">
            <button
              onClick={() => setCurrentTab('landing')}
              className={`transition-colors whitespace-nowrap py-1.5 ${
                currentTab === 'landing'
                  ? 'text-amber-300 border-b-2 border-amber-300 font-bold'
                  : 'text-slate-200 hover:text-amber-200'
              }`}
            >
              Squadron Home
            </button>

            <button
              onClick={() => setCurrentTab('member')}
              className={`transition-colors whitespace-nowrap flex items-center gap-1.5 py-1.5 ${
                currentTab === 'member'
                  ? 'text-amber-300 border-b-2 border-amber-300 font-bold'
                  : 'text-slate-200 hover:text-amber-200'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-amber-400" />
              <span>Cadet Music Locker</span>
            </button>

            <button
              onClick={() => setCurrentTab('admin')}
              className={`transition-colors whitespace-nowrap flex items-center gap-1.5 py-1.5 ${
                currentTab === 'admin'
                  ? 'text-amber-300 border-b-2 border-amber-300 font-bold'
                  : 'text-slate-200 hover:text-amber-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Officer & Staff Console</span>
            </button>

            <button
              onClick={onOpenSqlModal}
              className="text-slate-200 hover:text-amber-200 transition-colors whitespace-nowrap flex items-center gap-1 py-1.5"
            >
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>Supabase SQL</span>
            </button>
          </nav>

          {/* Zone 3: Settings & Role Selector */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenSettingsModal}
              title="Database Configuration"
              className="p-2 text-slate-300 hover:text-amber-300 hover:bg-[#122E58] rounded-lg transition-colors border border-blue-800/60"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Profile Menu & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#06142A] border border-amber-400/50 hover:border-amber-300 transition-colors text-left shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs font-bold border border-amber-400/60 font-mono">
                  {profile?.first_name?.[0] || 'C'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-white leading-tight">
                    <span className="text-amber-300 mr-1">{profile?.rank}</span>
                    {profile?.last_name}
                  </p>
                  <p className="text-[10px] text-slate-300 font-mono">
                    {profile?.role === 'admin' ? 'Officer / Admin' : 'Cadet Musician'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0C1E3C] border border-amber-500/30 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2.5 border-b border-blue-900/60 bg-[#071326] rounded-lg mb-1">
                    <p className="text-xs font-bold text-white">
                      {profile?.rank} {profile?.first_name} {profile?.last_name}
                    </p>
                    <p className="text-[11px] font-mono text-slate-300 truncate">
                      {profile?.cadet365_email}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-950 bg-amber-400 px-1.5 py-0.2 rounded uppercase font-mono">
                        {profile?.role === 'admin' ? 'Officer / Band Senior' : 'Cadet Musician'}
                      </span>
                      <span className="text-[10px] text-slate-300">· {profile?.instrument}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-900/60 px-2">
                    <button
                      onClick={() => {
                        signOut();
                        setIsProfileMenuOpen(false);
                        setCurrentTab('landing');
                      }}
                      className="w-full px-3 py-2 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-[#122A4E] rounded-lg flex items-center gap-1.5"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around border-t border-blue-900/60 bg-[#07152B] px-2 py-2 text-xs font-semibold">
          <button
            onClick={() => setCurrentTab('landing')}
            className={`px-3 py-1 rounded ${currentTab === 'landing' ? 'text-amber-300 font-bold bg-[#102B52]' : 'text-slate-300'}`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentTab('member')}
            className={`px-3 py-1 rounded ${currentTab === 'member' ? 'text-amber-300 font-bold bg-[#102B52]' : 'text-slate-300'}`}
          >
            Music Locker
          </button>
          <button
            onClick={() => setCurrentTab('admin')}
            className={`px-3 py-1 rounded ${currentTab === 'admin' ? 'text-amber-300 font-bold bg-[#102B52]' : 'text-slate-300'}`}
          >
            Officer Console
          </button>
          <button
            onClick={onOpenSqlModal}
            className="px-2 py-1 text-sky-400"
          >
            SQL
          </button>
        </div>
      </div>
    </header>
  );
};
