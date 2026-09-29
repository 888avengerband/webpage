import React, { useState } from 'react';
import {
  Music,
  Clock,
  MapPin,
  ArrowRight,
  Shield,
  ExternalLink,
  BookOpen,
  Award,
  ImageIcon,
  Users,
} from 'lucide-react';
import { SquadronCrest } from './SquadronCrest';

interface SplashPageProps {
  onGoToLogin: () => void;
  onOpenSqlModal: () => void;
}

interface SquadronPhoto {
  id: string;
  title: string;
  caption: string;
  src: string;
  sourceUrl: string;
}

const SQUADRON_PHOTOS: SquadronPhoto[] = [
  {
    id: 'acr',
    title: 'Annual Ceremonial Review (ACR)',
    caption: '888 Avenger Royal Canadian Air Cadet Squadron on parade during the Annual Ceremonial Review in Vancouver, BC.',
    src: '/images/squadron_acr.jpg',
    sourceUrl: 'http://888aircadets.ca/',
  },
  {
    id: 'parade',
    title: 'Squadron Parade March',
    caption: 'Cadets marching with the official 888 Avenger Royal Canadian Air Cadet Squadron banner.',
    src: '/images/squadron_parade.jpg',
    sourceUrl: 'http://888aircadets.ca/',
  },
  {
    id: 'activity',
    title: 'Cadet Training & Teamwork',
    caption: 'Squadron cadets participating in leadership training and community band activities.',
    src: '/images/cadets_activity.jpg',
    sourceUrl: 'http://888aircadets.ca/',
  },
];

export const SplashPage: React.FC<SplashPageProps> = ({
  onGoToLogin,
  onOpenSqlModal,
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const activePhoto = SQUADRON_PHOTOS[activePhotoIndex];

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-body">
      {/* Minimal Top Header */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-sky-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SquadronCrest size="sm" />
            <div>
              <span className="font-heading font-black text-sm tracking-tight text-slate-900 block leading-tight">
                <span className="text-sky-600 font-black mr-1 font-squadron-num">888</span>
                Avenger Squadron
              </span>
              <span className="text-[11px] text-sky-600 font-mono font-medium block">
                Phantom Flight · Vancouver, BC
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="http://888aircadets.ca/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 hover:text-sky-600 font-medium transition-colors mr-1"
            >
              <span>888aircadets.ca</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <button
              onClick={onGoToLogin}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <span>Cadet Portal Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Splash Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col items-center text-center">
        {/* Squadron Logo Presentation */}
        <div className="mb-6 p-4 rounded-2xl bg-sky-50/70 border border-sky-100 transition-transform hover:scale-105 duration-200">
          <SquadronCrest size="xl" showMotto={false} />
        </div>

        {/* Small Cadet Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-mono font-semibold mb-4">
          <Shield className="w-3.5 h-3.5 text-sky-500" />
          <span>ROYAL CANADIAN AIR CADETS · VANCOUVER, BC</span>
        </div>

        {/* Main Title with Dedicated High-Impact Squadron Typography */}
        <h1 className="font-heading text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl">
          <span className="font-squadron-num text-sky-600 font-black tracking-tight inline-block mr-2 sm:mr-3">
            888
          </span>
          <span className="text-slate-900 font-extrabold tracking-tight">
            Avenger Squadron Band
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl font-body">
          Official sheet music locker, rehearsal attendance tracker, and member administration system for cadet musicians in Vancouver, British Columbia.
        </p>

        {/* Primary CTA Button */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onGoToLogin}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Music className="w-4 h-4" />
            <span>Enter Cadet Music Locker</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>

          <a
            href="http://888aircadets.ca/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-sky-50 text-slate-700 border border-sky-200 font-semibold text-sm transition-colors shadow-sm"
          >
            <span>Visit 888aircadets.ca</span>
            <ExternalLink className="w-3.5 h-3.5 text-sky-500" />
          </a>
        </div>

        {/* Featured Image from 888's Official Website */}
        <div className="mt-12 w-full max-w-4xl text-left">
          <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
            {/* Top Bar for Image Showcase */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-sky-50/80 via-white to-sky-50/50 border-b border-sky-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-800 tracking-wide font-heading">
                  888 Avenger Squadron in Action
                </span>
                <span className="text-[10px] font-mono text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full font-medium">
                  from 888aircadets.ca
                </span>
              </div>

              {/* Photo Selector Tabs */}
              <div className="flex items-center gap-1.5 text-xs font-medium bg-slate-100/80 p-1 rounded-xl">
                {SQUADRON_PHOTOS.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setActivePhotoIndex(index)}
                    className={`px-3 py-1 rounded-lg text-[11px] transition-all ${
                      activePhotoIndex === index
                        ? 'bg-white text-sky-700 font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {photo.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Display with High-Res Image from 888aircadets.ca */}
            <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-slate-900 overflow-hidden group">
              <img
                src={activePhoto.src}
                alt={activePhoto.title}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />

              {/* Overlay Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[11px] font-mono font-medium mb-1.5 text-white">
                    <ImageIcon className="w-3 h-3 text-sky-300" />
                    <span>{activePhoto.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-100 leading-snug drop-shadow-sm font-medium">
                    {activePhoto.caption}
                  </p>
                </div>

                <a
                  href={activePhoto.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-900 text-xs font-semibold backdrop-blur-md transition-all shadow"
                >
                  <span>888aircadets.ca</span>
                  <ExternalLink className="w-3 h-3 text-sky-600" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Light Blue & White Information Cards (Privacy & RLS removed) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10 w-full text-left">
          {/* Card 1: Rehearsals */}
          <div className="p-6 rounded-2xl bg-white border border-sky-100 shadow-sm hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Parade & Rehearsals</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Parade: 18:30 – 21:15 hrs · Band: 18:30 – 21:00 hrs (Tuesdays & Wednesdays during the training year).
            </p>
            <div className="mt-4 pt-3 border-t border-sky-50 text-[11px] text-slate-600 font-mono flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>Walter Moberly School · Vancouver</span>
            </div>
          </div>

          {/* Card 2: Sheet Music Locker */}
          <div className="p-6 rounded-2xl bg-white border border-sky-100 shadow-sm hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-4">
              <Music className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Cadet Music Locker</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Direct access to assigned instrument parts, scores, PDF preview, and downloads.
            </p>
            <div className="mt-4 pt-3 border-t border-sky-50 text-[11px] text-slate-600 font-mono flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>Woodwinds · Brass · Percussion</span>
            </div>
          </div>

          {/* Card 3: Phantom Flight Band Division */}
          <div className="p-6 rounded-2xl bg-white border border-sky-100 shadow-sm hover:border-sky-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Phantom Flight Excellence</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Ceremonial drill, musical performance mastery, and leadership in the Vancouver community.
            </p>
            <div className="mt-4 pt-3 border-t border-sky-50 text-[11px] text-slate-600 font-mono flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>Royal Canadian Air Cadets</span>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full bg-white border-t border-sky-100 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            888 Avenger Royal Canadian Air Cadet Squadron Band · Vancouver, BC
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Walter Moberly Elementary · 1000 E 59th Ave</span>
            <span>·</span>
            <a
              href="http://888aircadets.ca/"
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 hover:underline"
            >
              888aircadets.ca
            </a>
            <span>·</span>
            <button
              onClick={onOpenSqlModal}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              Database Setup
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
