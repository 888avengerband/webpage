import React, { useState } from 'react';
import {
  Music,
  Calendar,
  User,
  Clock,
  Download,
  Eye,
  Send,
  CheckCircle,
  AlertCircle,
  FileText,
  Shield,
  Phone,
  Mail,
  Award,
  Search,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBandData } from '../context/BandDataContext';
import { CadetAssignedMusic, CADET_RANKS, STANDARD_INSTRUMENTS } from '../types/database';
import { PdfViewerModal } from './PdfViewerModal';

export const MemberDashboard: React.FC = () => {
  const { profile, updateCurrentProfile } = useAuth();
  const {
    myAssignedMusic,
    visibleAttendance,
    getCadetAttendanceStats,
    visibleExcusedAbsences,
    submitExcusedAbsence,
  } = useBandData();

  // Sub-tabs in Member Dashboard
  const [activeSubTab, setActiveSubTab] = useState<'music' | 'attendance' | 'profile' | 'absence'>('music');

  // Search filter for music
  const [musicSearch, setMusicSearch] = useState('');

  // PDF Viewer Modal state
  const [activeScore, setActiveScore] = useState<CadetAssignedMusic | null>(null);

  // Profile Edit form state
  const [editRank, setEditRank] = useState(profile?.rank || 'Cdt');
  const [editInstrument, setEditInstrument] = useState(profile?.instrument || 'Clarinet');
  const [editPhone, setEditPhone] = useState(profile?.phone || '');
  const [profileSavedMessage, setProfileSavedMessage] = useState(false);

  // Absence Form state
  const [absenceDate, setAbsenceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [absenceReason, setAbsenceReason] = useState('');
  const [absenceSubmitted, setAbsenceSubmitted] = useState(false);
  const [absenceError, setAbsenceError] = useState<string | null>(null);

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">
        <User className="w-12 h-12 mx-auto text-amber-400 mb-3" />
        <h3 className="text-lg font-semibold text-white">No active cadet profile loaded</h3>
        <p className="text-xs mt-1">Please select a persona in the top right menu to view this dashboard.</p>
      </div>
    );
  }

  const attendanceStats = getCadetAttendanceStats(profile.id);

  const filteredMusic = myAssignedMusic.filter(
    m =>
      m.title.toLowerCase().includes(musicSearch.toLowerCase()) ||
      m.instrumentPart.toLowerCase().includes(musicSearch.toLowerCase()) ||
      m.composer.toLowerCase().includes(musicSearch.toLowerCase())
  );

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCurrentProfile({
      rank: editRank,
      instrument: editInstrument,
      phone: editPhone.trim() || null,
    });
    setProfileSavedMessage(true);
    setTimeout(() => setProfileSavedMessage(false), 3000);
  };

  const handleAbsenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAbsenceError(null);

    if (!absenceDate) {
      setAbsenceError('Please select a date for your absence.');
      return;
    }
    if (!absenceReason.trim()) {
      setAbsenceError('Please specify the reason for your absence (e.g., school exam, illness, cadet competition).');
      return;
    }

    const ok = await submitExcusedAbsence(absenceDate, absenceReason);
    if (ok) {
      setAbsenceSubmitted(true);
      setAbsenceReason('');
      setTimeout(() => setAbsenceSubmitted(false), 4000);
    } else {
      setAbsenceError('Failed to submit absence request.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Cadet Header Card */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0C244A] via-[#0E2852] to-[#0A1B36] border-2 border-amber-400/40 p-6 sm:p-7 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-[#0A1B36] border-2 border-amber-400 flex items-center justify-center text-amber-300 font-heading font-black text-2xl shadow-lg">
              {profile.first_name[0]}{profile.last_name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950 uppercase shadow-sm">
                  {profile.rank}
                </span>
                <span className="text-xs text-amber-200/80 font-mono">
                  Squadron Musician
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mt-1">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-xs text-slate-200 mt-0.5">
                Instrument: <strong className="text-amber-300 font-semibold">{profile.instrument}</strong> · 888 Avenger Squadron Band (Vancouver, BC)
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 sm:border-l sm:border-blue-900 sm:pl-6 text-xs font-mono">
            <div>
              <p className="text-slate-300 text-[11px]">Attendance Rate</p>
              <p className="text-xl font-bold text-emerald-400 tabular-nums">
                {attendanceStats.rate}%
              </p>
            </div>
            <div className="border-l border-blue-900 pl-4">
              <p className="text-slate-300 text-[11px]">Music Parts</p>
              <p className="text-xl font-bold text-amber-300 tabular-nums">
                {myAssignedMusic.length}
              </p>
            </div>
            <div className="border-l border-blue-900 pl-4">
              <p className="text-slate-300 text-[11px]">Parades Logged</p>
              <p className="text-xl font-bold text-white tabular-nums">
                {attendanceStats.total}
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-blue-900/80 flex flex-wrap gap-2">
          {[
            { id: 'music', label: 'My Sheet Music Locker', icon: Music, badge: myAssignedMusic.length },
            { id: 'attendance', label: 'My Attendance Log', icon: Calendar, badge: `${attendanceStats.rate}%` },
            { id: 'absence', label: 'Excused Absence Form', icon: Clock, badge: visibleExcusedAbsences.length },
            { id: 'profile', label: 'My Cadet Profile', icon: User },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                    : 'bg-[#07172F] text-slate-200 hover:text-white hover:bg-[#112C57] border border-blue-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-[#0E2850] text-amber-300 font-bold'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SHEET MUSIC LOCKER */}
      {/* ========================================================================= */}
      {activeSubTab === 'music' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-amber-400" />
                <span>Assigned Music Locker</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Authorized parts for {profile.rank} {profile.last_name} ({profile.instrument})
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={musicSearch}
                onChange={e => setMusicSearch(e.target.value)}
                placeholder="Search score title or part..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {filteredMusic.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#0D2345] border border-blue-800/80 text-slate-300">
              <Music className="w-10 h-10 mx-auto text-amber-400 mb-3" />
              <p className="text-sm font-semibold text-white">No Sheet Music Assigned Yet</p>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                Band Officers and Band Seniors assign parts based on your instrumentation. Contact the Drum Major or Band Officer if your part is missing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMusic.map(item => (
                <div
                  key={item.assignmentId}
                  className="rounded-xl bg-[#0D2345] border border-blue-800/80 hover:border-amber-400/60 p-5 flex flex-col justify-between transition-all group shadow-lg"
                >
                  <div>
                    {/* Top Row Part Tag */}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="font-mono text-amber-300 bg-[#06142A] border border-amber-400/50 px-2.5 py-0.5 rounded text-[11px] font-bold">
                        {item.instrumentPart}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Secured PDF
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs italic text-slate-300 mt-0.5">
                      {item.composer}
                    </p>

                    <div className="mt-4 pt-3 border-t border-blue-900/80 text-[11px] text-slate-300 flex items-center justify-between">
                      <span>Assigned: {new Date(item.assignedAt).toLocaleDateString()}</span>
                      <span className="font-mono text-amber-300/80">888-SCORE</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-blue-900/80 flex items-center gap-2">
                    <button
                      onClick={() => setActiveScore(item)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0F2D59] hover:bg-[#153D78] border border-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>View Score</span>
                    </button>

                    <a
                      href={item.fileUrl}
                      download={`${item.title.replace(/\s+/g, '_')}_${item.instrumentPart.replace(/\s+/g, '_')}.pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-[#06142A] hover:bg-[#102B52] text-amber-300 hover:text-white transition-colors border border-blue-900"
                      title="Download PDF Part"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MY ATTENDANCE LOG */}
      {/* ========================================================================= */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-6">
          <div className="pb-2 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Personal Attendance History</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Row Level Security ensures only your personal parade attendance is visible here.
            </p>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="text-xs text-slate-400">Total Parades</p>
              <p className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">{attendanceStats.total}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="text-xs text-slate-400">Present</p>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">{attendanceStats.present}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="text-xs text-slate-400">Late</p>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">{attendanceStats.late}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <p className="text-xs text-slate-400">Absent Excused (AE)</p>
              <p className="text-2xl font-bold font-mono text-blue-400 mt-1 tabular-nums">{attendanceStats.excused}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center col-span-2 sm:col-span-1">
              <p className="text-xs text-slate-400">Unexcused Absent</p>
              <p className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">{attendanceStats.absent}</p>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="px-6 py-3 bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-300">
              Rehearsal Date Log
            </div>
            <div className="divide-y divide-slate-800/80">
              {visibleAttendance.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No attendance records logged for your profile yet.
                </div>
              ) : (
                visibleAttendance.map(record => {
                  let badgeColor = 'bg-slate-800 text-slate-300';
                  if (record.status === 'Present') badgeColor = 'bg-emerald-950 text-emerald-400 border border-emerald-800/50';
                  if (record.status === 'Late') badgeColor = 'bg-amber-950 text-amber-300 border border-amber-800/50';
                  if (record.status === 'Absent Excused - AE') badgeColor = 'bg-blue-950 text-blue-300 border border-blue-800/50';
                  if (record.status === 'Absent') badgeColor = 'bg-rose-950 text-rose-300 border border-rose-800/50';

                  return (
                    <div
                      key={record.id}
                      className="px-6 py-3.5 flex items-center justify-between text-xs hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-white font-medium">{record.date}</span>
                        <span className="text-slate-500">· Wednesday Drill Night</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded font-semibold text-[11px] ${badgeColor}`}>
                          {record.status}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          Logged {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EXCUSED ABSENCE FORM */}
      {/* ========================================================================= */}
      {activeSubTab === 'absence' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Submission Form */}
          <div className="lg:col-span-6 space-y-6">
            <div className="pb-2 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Submit Excused Absence Request</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Notify Band Officers in advance. Once approved, the record is auto-marked as Absent Excused (AE).
              </p>
            </div>

            {absenceSubmitted && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-200 flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-100">Request Submitted Successfully</p>
                  <p className="mt-0.5 text-emerald-300">
                    Your absence has been routed to the Band Officers & Band Seniors for review.
                  </p>
                </div>
              </div>
            )}

            {absenceError && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-xs text-rose-300">
                {absenceError}
              </div>
            )}

            <form onSubmit={handleAbsenceSubmit} className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Rehearsal / Parade Date *
                </label>
                <input
                  type="date"
                  required
                  value={absenceDate}
                  onChange={e => setAbsenceDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reason for Absence *
                </label>
                <textarea
                  rows={4}
                  required
                  value={absenceReason}
                  onChange={e => setAbsenceReason(e.target.value)}
                  placeholder="e.g. Vancouver school midterm exam preparation, illness, or regional cadet competition..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Band Standing Orders require requests to be submitted prior to rehearsal so Section Leaders can plan instrumentation.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Band Officers</span>
              </button>
            </form>
          </div>

          {/* Past Submitted Requests */}
          <div className="lg:col-span-6 space-y-6">
            <div className="pb-2 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>My Absence Requests ({visibleExcusedAbsences.length})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Current approval status of your requests
              </p>
            </div>

            <div className="space-y-3">
              {visibleExcusedAbsences.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-500">
                  No absence requests submitted.
                </div>
              ) : (
                visibleExcusedAbsences.map(req => {
                  let statusBadge = 'bg-amber-950 text-amber-400 border border-amber-800';
                  if (req.status === 'Approved') statusBadge = 'bg-emerald-950 text-emerald-400 border border-emerald-800';
                  if (req.status === 'Rejected') statusBadge = 'bg-rose-950 text-rose-400 border border-rose-800';

                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-white font-semibold">
                          Date: {req.date_of_absence}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${statusBadge}`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800">
                        {req.reason}
                      </p>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Submitted: {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MY CADET PROFILE */}
      {/* ========================================================================= */}
      {activeSubTab === 'profile' && (
        <div className="max-w-2xl space-y-6">
          <div className="pb-2 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              <span>My Cadet Profile Information</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Keep your contact details up to date for squadron communications
            </p>
          </div>

          {profileSavedMessage && (
            <div className="p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleProfileSave} className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-400 mb-1">First Name (Official)</label>
                <input
                  type="text"
                  disabled
                  value={profile.first_name}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-400 mb-1">Last Name (Official)</label>
                <input
                  type="text"
                  disabled
                  value={profile.last_name}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-400 mb-1">
                Cadet365 Email (Primary Auth)
              </label>
              <input
                type="email"
                disabled
                value={profile.cadet365_email}
                className="w-full px-3 py-2 font-mono bg-slate-950/50 border border-slate-800 rounded-lg text-slate-400 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Cadet365 email accounts are managed by the Department of National Defence / RCSU.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Current Rank</label>
                <select
                  value={editRank}
                  onChange={e => setEditRank(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                >
                  {CADET_RANKS.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label} ({r.fullTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Primary Instrument</label>
                <select
                  value={editInstrument}
                  onChange={e => setEditInstrument(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                >
                  {STANDARD_INSTRUMENTS.map(i => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
                placeholder="(604) 555-0100"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Protected by RLS: Only visible to Band Officers and Staff.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-colors"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {activeScore && (
        <PdfViewerModal
          isOpen={Boolean(activeScore)}
          onClose={() => setActiveScore(null)}
          title={activeScore.title}
          composer={activeScore.composer}
          instrumentPart={activeScore.instrumentPart}
          fileUrl={activeScore.fileUrl}
        />
      )}
    </div>
  );
};
