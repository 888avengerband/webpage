import React from 'react';
import {
  Shield,
  Music,
  ChevronRight,
  Award,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SquadronCrest } from './SquadronCrest';

interface LandingPageProps {
  onEnterPortal: (destination: 'member' | 'admin') => void;
  onOpenSqlModal: () => void;
  onOpenAuthModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterPortal,
  onOpenSqlModal,
  onOpenAuthModal,
}) => {
  const { isAdmin } = useAuth();

  return (
    <div className="space-y-14 pb-16">
      {/* Hero Showcase (Clean, Authentic Military Band Design — No AI Images) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#081830] via-[#0B2042] to-[#0A1931] border-b-2 border-amber-400/40 pt-10 pb-16 md:py-20 shadow-xl">
        {/* Subtle geometric grid background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#FFE066 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 space-y-6">
              {/* Unit Header Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#06142A] border border-amber-400/60 text-amber-300 text-xs font-mono font-bold shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                <span>888 AVENGER RCACS · SOUTH VANCOUVER, BRITISH COLUMBIA</span>
              </div>

              <h1
                className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-sm"
                style={{ textWrap: 'balance' }}
              >
                <span className="font-squadron-num text-amber-300 mr-2">888</span>
                Avenger Squadron Band Portal
              </h1>

              <p className="text-slate-200 text-base sm:text-lg leading-relaxed max-w-2xl font-body">
                Official management and secure sheet music repository for the 888 Avenger Royal Canadian Air Cadet Squadron Military Band. Serving cadet musicians at <strong>Walter Moberly Elementary School</strong> in South Vancouver with musical mastery, ceremonial drill, and leadership since 2010.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onEnterPortal(isAdmin ? 'admin' : 'member')}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-bold text-sm shadow-xl shadow-amber-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Music className="w-4 h-4 text-slate-950" />
                  <span>Enter Cadet Music Locker</span>
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </button>

                <a
                  href="http://888aircadets.ca/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#0F2850] hover:bg-[#15386E] text-amber-300 border border-amber-400/50 font-semibold text-sm transition-colors shadow-md"
                >
                  <span>Official 888aircadets.ca</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Verified Squadron Facts */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-blue-900/60 text-xs">
                <div className="p-3 rounded-lg bg-[#07172F]/80 border border-blue-900/60">
                  <span className="font-mono text-base font-bold text-amber-300 block">Vancouver, BC</span>
                  <p className="text-slate-300 mt-0.5">South Vancouver Unit</p>
                </div>
                <div className="p-3 rounded-lg bg-[#07172F]/80 border border-blue-900/60">
                  <span className="font-mono text-base font-bold text-white block">Walter Moberly</span>
                  <p className="text-slate-300 mt-0.5">1000 E 59th Ave</p>
                </div>
                <div className="p-3 rounded-lg bg-[#07172F]/80 border border-blue-900/60">
                  <span className="font-mono text-base font-bold text-sky-300 block">18:30 – 21:15</span>
                  <p className="text-slate-300 mt-0.5">Parade: 21:15 · Band: 21:00</p>
                </div>
              </div>
            </div>

            {/* Right Column: Pure Vector Heraldic Centerpiece (No AI Photos) */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border-2 border-amber-400/60 bg-gradient-to-br from-[#0E274F] via-[#091C3A] to-[#061226] p-7 shadow-2xl relative overflow-hidden text-center">
                {/* Subtle decorative heraldic rays */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                {/* Pure Vector Scalable Squadron Crest */}
                <div className="flex justify-center mb-4">
                  <SquadronCrest size="xl" showMotto={true} />
                </div>

                <div className="space-y-1.5 mt-2">
                  <h2 className="font-heading text-xl font-bold text-white tracking-wide">
                    888 Avenger Squadron
                  </h2>
                  <p className="text-xs font-mono text-amber-300 font-semibold tracking-wider uppercase">
                    Royal Canadian Air Cadets · Phantom Flight
                  </p>
                  <p className="text-xs text-slate-300 pt-2 leading-relaxed px-2">
                    Established under the authority of the Air Cadet League of Canada and Department of National Defence to promote leadership, drill excellence, and musical mastery.
                  </p>
                </div>

                {/* Section Quick Stats */}
                <div className="mt-6 pt-5 border-t border-blue-900/80 grid grid-cols-2 gap-3 text-left">
                  <div className="p-2.5 rounded-lg bg-[#06142A] border border-blue-900/70">
                    <p className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Parade Square</p>
                    <p className="text-xs font-bold text-white">Walter Moberly Gym</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#06142A] border border-blue-900/70">
                    <p className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Cadet Security</p>
                    <p className="text-xs font-bold text-emerald-400">Protected Music Locker</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Band Sections Breakdown (Crisp SVG Icons & Real Military Band Sections) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono text-amber-300 uppercase tracking-widest font-bold">
            888 Squadron Instrumentation
          </span>
          <h2 className="font-heading text-2xl font-bold text-white mt-1">
            Military Concert & Marching Band Sections
          </h2>
          <p className="text-xs text-slate-300 mt-2">
            Structured musical sections under the direction of the Band Officer, Civilian Instructors, and Cadet Drum Major.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Section 1: Woodwinds */}
          <div className="p-6 rounded-xl bg-[#0D2345] border border-blue-800/80 hover:border-amber-400/60 transition-all shadow-lg hover:translate-y-[-2px]">
            <div className="w-12 h-12 rounded-xl bg-[#06152B] border border-amber-400/40 text-amber-300 flex items-center justify-center mb-4 shadow-inner">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Woodwind Ensemble</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Flutes, Piccolos, Bb Clarinets, Bass Clarinets, and Saxophone flight (Alto, Tenor, Baritone).
            </p>
            <div className="mt-4 pt-3 border-t border-blue-900/80 text-[11px] font-mono text-amber-300">
              Key Repertoire: Counter-melodies & flourishes
            </div>
          </div>

          {/* Section 2: Brass Fanfare */}
          <div className="p-6 rounded-xl bg-[#0D2345] border border-blue-800/80 hover:border-amber-400/60 transition-all shadow-lg hover:translate-y-[-2px]">
            <div className="w-12 h-12 rounded-xl bg-[#06152B] border border-amber-400/40 text-amber-300 flex items-center justify-center mb-4 shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Brass Flight</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Trumpets 1-3, French Horns, Tenor Trombones, Bass Trombone, Euphonium, and Sousaphone / Tubas.
            </p>
            <div className="mt-4 pt-3 border-t border-blue-900/80 text-[11px] font-mono text-amber-300">
              Key Repertoire: Fanfares, marches & hymns
            </div>
          </div>

          {/* Section 3: Percussion Corps */}
          <div className="p-6 rounded-xl bg-[#0D2345] border border-blue-800/80 hover:border-amber-400/60 transition-all shadow-lg hover:translate-y-[-2px]">
            <div className="w-12 h-12 rounded-xl bg-[#06152B] border border-amber-400/40 text-amber-300 flex items-center justify-center mb-4 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Percussion Corps</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Snare Drums, Tenor Drums, Bass Drum, Crash Cymbals, and Glockenspiel / Marching Bells.
            </p>
            <div className="mt-4 pt-3 border-t border-blue-900/80 text-[11px] font-mono text-amber-300">
              Cadence: 120 paces per minute (RCAF standard)
            </div>
          </div>

          {/* Section 4: Drum Major & Leadership */}
          <div className="p-6 rounded-xl bg-[#0D2345] border border-blue-800/80 hover:border-amber-400/60 transition-all shadow-lg hover:translate-y-[-2px]">
            <div className="w-12 h-12 rounded-xl bg-[#06152B] border border-amber-400/40 text-amber-300 flex items-center justify-center mb-4 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Drum Major & Leadership</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Cadet Band Commander, Drum Major with ceremonial mace, and senior flight sergeants leading drill maneuvers.
            </p>
            <div className="mt-4 pt-3 border-t border-blue-900/80 text-[11px] font-mono text-amber-300">
              Command: Visual drill mace signals & paces
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
