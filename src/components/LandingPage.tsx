import React from 'react';
import {
  Shield,
  Music,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Award,
  Users,
  FileText,
  CheckCircle2,
  BellRing,
  ExternalLink,
  Lock,
  Compass,
  Building,
  Sparkles,
  BookOpen,
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
  const { role, isAdmin } = useAuth();

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

      {/* Repertoire Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-blue-900/80">
          <div>
            <span className="text-xs font-mono text-amber-300 tracking-wider uppercase block mb-1 font-bold">
              Active Music Repertoire
            </span>
            <h2 className="font-heading text-2xl font-bold text-white">
              Ceremonial Marches & Concert Literature
            </h2>
          </div>
          <button
            onClick={() => onEnterPortal('member')}
            className="mt-3 md:mt-0 text-xs font-bold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1 transition-colors"
          >
            <span>Open Cadet Music Locker</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: 'The Great Escape',
              composer: 'Elmer Bernstein',
              description: 'Primary parade march with soaring brass fanfare and syncopated woodwind counter-melodies.',
              parts: 'Trumpet, Clarinet, Flute, Snare',
            },
            {
              title: 'RCAF March Past',
              composer: 'Sir Walford Davies',
              description: 'The official ceremonial march of the Royal Canadian Air Force and Air Cadet League.',
              parts: 'Full Conductor Score, Brass, Reeds',
            },
            {
              title: 'Heart of Oak',
              composer: 'Dr. William Boyce',
              description: 'Ceremonial quickstep performed at inter-element and naval joint evolutions in Vancouver.',
              parts: 'Flute, Clarinet, Trumpet, Drums',
            },
            {
              title: 'O Canada (Ceremonial Bb)',
              composer: 'Calixa Lavallée',
              description: 'Standard military band anthem arranged for solemn parade presentations and ACR inspection.',
              parts: 'Full Symphonic Band Key Bb',
            },
          ].map((song, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[#0D2345] border border-blue-800/80 hover:border-amber-400/50 transition-colors flex flex-col justify-between shadow-md"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-amber-300 font-mono mb-2 font-bold">
                  <span>Score 0{idx + 1}</span>
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{song.title}</h3>
                <p className="text-[11px] text-slate-300 italic mb-2">{song.composer}</p>
                <p className="text-xs text-slate-200 leading-relaxed mb-4">{song.description}</p>
              </div>
              <div className="pt-3 border-t border-blue-900/80 text-[11px] text-slate-300 font-mono">
                Parts: {song.parts}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Routine Orders & Vancouver Parades */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-[#0C244A] via-[#0D2345] to-[#071830] border-2 border-amber-400/40 p-8 shadow-2xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/40 shrink-0">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-amber-300 uppercase tracking-wider block font-bold">
                Squadron Routine Orders
              </span>
              <h3 className="text-xl font-bold text-white font-heading">
                Upcoming 888 Avenger Band Engagements (Vancouver, BC)
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="p-4 rounded-xl bg-[#07172F] border border-blue-900/80">
              <p className="font-mono text-amber-300 font-bold">11 October 2026</p>
              <h4 className="font-bold text-white mt-1 text-sm">Battle of Britain Memorial</h4>
              <p className="text-slate-300 mt-1 leading-relaxed">
                Ceremonial massed band performance in Vancouver. Full C-1 uniform with white accoutrements.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#07172F] border border-blue-900/80">
              <p className="font-mono text-amber-300 font-bold">11 November 2026</p>
              <h4 className="font-bold text-white mt-1 text-sm">Remembrance Day Parade (Vancouver)</h4>
              <p className="text-slate-300 mt-1 leading-relaxed">
                Annual civic parade march at Vancouver Cenotaph / Victory Square & Chinatown. Band leads flight formations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#07172F] border border-blue-900/80">
              <p className="font-mono text-amber-300 font-bold">28 May 2027</p>
              <h4 className="font-bold text-white mt-1 text-sm">Annual Ceremonial Review (ACR)</h4>
              <p className="text-slate-300 mt-1 leading-relaxed">
                Vancouver South drill square annual inspection, presentation of arms, musical salute, and squadron awards.
              </p>
            </div>
          </div>

          {/* Absence note reminder */}
          <div className="mt-6 pt-5 border-t border-blue-900/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
            <p>
              <strong className="text-amber-300">Cadet Notice:</strong> Anticipating an absence from parade night? Submit an Excused Absence Form at least 48 hours prior to rehearsal.
            </p>
            <button
              onClick={() => onEnterPortal('member')}
              className="text-amber-300 hover:text-amber-200 font-bold underline underline-offset-4"
            >
              Submit Absence Request →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
