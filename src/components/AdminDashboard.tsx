import React, { useState, useMemo } from 'react';
import {
  Users,
  Calendar,
  Music,
  Plus,
  ArrowUpDown,
  Download,
  CheckCircle2,
  Clock,
  Check,
  X,
  Trash2,
  FileSpreadsheet,
  Upload,
  UserPlus,
  Search,
  Shield,
  Phone,
  Mail,
  Award,
  Zap,
  Filter,
} from 'lucide-react';
import { useBandData } from '../context/BandDataContext';
import {
  Profile,
  CadetRank,
  AttendanceStatus,
  SheetMusic,
  SongPart,
  CADET_RANKS,
  STANDARD_INSTRUMENTS,
} from '../types/database';
import { AddMemberModal } from './AddMemberModal';
import { UploadMusicModal } from './UploadMusicModal';
import { AssignPartModal } from './AssignPartModal';
import { PdfViewerModal } from './PdfViewerModal';

export const AdminDashboard: React.FC = () => {
  const {
    profiles,
    deleteMember,
    sheetMusic,
    songParts,
    partAssignments,
    deleteSong,
    deleteSongPart,
    attendanceRecords,
    markAttendance,
    markAllPresentForDate,
    getAttendanceForDate,
    getCadetAttendanceStats,
    activeRehearsalDate,
    setActiveRehearsalDate,
    rehearsalDates,
    excusedAbsences,
    reviewExcusedAbsence,
    autoMarkAE,
  } = useBandData();

  // Navigation sub-tabs
  const [activeTab, setActiveTab] = useState<'roster' | 'attendance' | 'music'>('attendance');

  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isUploadMusicOpen, setIsUploadMusicOpen] = useState(false);
  const [assigningPartData, setAssigningPartData] = useState<{
    part: SongPart;
    song: SheetMusic;
  } | null>(null);
  const [previewScore, setPreviewScore] = useState<{
    title: string;
    composer: string;
    instrumentPart: string;
    fileUrl: string;
  } | null>(null);

  // Roster sorting & filtering
  type SortField = 'first_name' | 'last_name' | 'rank' | 'cadet365_email';
  const [sortField, setSortField] = useState<SortField>('last_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [rosterSearch, setRosterSearch] = useState('');
  const [instrumentFilter, setInstrumentFilter] = useState('all');

  // Auto-mark notification alert
  const [autoMarkSuccess, setAutoMarkSuccess] = useState<string | null>(null);

  // Date input for adding a new rehearsal date
  const [newRehearsalInput, setNewRehearsalInput] = useState('');

  // ---------------------------------------------------------------------------
  // ROSTER LOGIC
  // ---------------------------------------------------------------------------
  const rankPriority: Record<CadetRank, number> = {
    Maj: 16,
    Capt: 15,
    Lt: 14,
    '2Lt': 13,
    OCdt: 12,
    CI: 11,
    CV: 10,
    WO1: 9,
    WO2: 8,
    FSgt: 7,
    Sgt: 6,
    FCpl: 5,
    Cpl: 4,
    LAC: 3,
    Cdt: 2,
  };

  const sortedProfiles = useMemo(() => {
    let list = [...profiles];

    if (rosterSearch.trim()) {
      const q = rosterSearch.toLowerCase();
      list = list.filter(
        p =>
          p.first_name.toLowerCase().includes(q) ||
          p.last_name.toLowerCase().includes(q) ||
          p.cadet365_email.toLowerCase().includes(q) ||
          p.instrument.toLowerCase().includes(q) ||
          p.rank.toLowerCase().includes(q)
      );
    }

    if (instrumentFilter !== 'all') {
      list = list.filter(p => p.instrument === instrumentFilter);
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'rank') {
        cmp = (rankPriority[a.rank] || 0) - (rankPriority[b.rank] || 0);
      } else {
        cmp = a[sortField].localeCompare(b[sortField]);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [profiles, sortField, sortOrder, rosterSearch, instrumentFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // ---------------------------------------------------------------------------
  // ATTENDANCE LOGIC
  // ---------------------------------------------------------------------------
  const attendanceMap = getAttendanceForDate(activeRehearsalDate);
  const pendingAbsences = excusedAbsences.filter(ea => ea.status === 'Pending');

  const handleAutoMarkAE = async (absenceId: string, cadetName: string) => {
    const success = await autoMarkAE(absenceId);
    if (success) {
      setAutoMarkSuccess(`Auto-Marked AE for ${cadetName} on rehearsal date.`);
      setTimeout(() => setAutoMarkSuccess(null), 4000);
    }
  };

  // Export Attendance to CSV
  const handleExportCsv = () => {
    const headers = ['Cadet Name', 'Rank', 'Cadet365 Email', 'Instrument', 'Date', 'Status'];
    const rows: string[][] = [];

    profiles
      .filter(p => p.role === 'member')
      .forEach(cadet => {
        rehearsalDates.forEach(date => {
          const rec = attendanceRecords.find(
            r => r.profile_id === cadet.id && r.date === date
          );
          const status = rec ? rec.status : 'Unrecorded';
          rows.push([
            `"${cadet.first_name} ${cadet.last_name}"`,
            cadet.rank,
            cadet.cadet365_email,
            `"${cadet.instrument}"`,
            date,
            `"${status}"`,
          ]);
        });
      });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `888_Avenger_Band_Attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Navigation */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0C244A] via-[#0E2852] to-[#0A1B36] border-2 border-amber-400/40 p-6 sm:p-7 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 uppercase shadow-sm">
                Officer & Band Senior Command Console
              </span>
              <span className="text-xs text-amber-200/80 font-mono">888 Avenger Squadron Band (Vancouver, BC)</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">Band Management Console</h1>
            <p className="text-xs text-slate-200 mt-0.5">
              Full administrative read/write access to cadet rosters, roll-call attendance, and score part distribution.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-md hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4 text-slate-950" />
              <span>+ Add Member</span>
            </button>

            <button
              onClick={() => setIsUploadMusicOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0F2D59] hover:bg-[#163E75] text-white border border-blue-700 text-xs font-bold transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>+ Upload Music</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="mt-6 pt-4 border-t border-blue-900/80 flex flex-wrap gap-2">
          {[
            { id: 'attendance', label: 'Attendance Roll-Call & Excused Absences', icon: Calendar, badge: pendingAbsences.length },
            { id: 'roster', label: 'Cadet Roster Management', icon: Users, badge: profiles.length },
            { id: 'music', label: 'Repertoire & Part Assignment Manager', icon: Music, badge: sheetMusic.length },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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

      {autoMarkSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-xs text-emerald-200 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>{autoMarkSuccess}</span>
          </div>
          <button onClick={() => setAutoMarkSuccess(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: ATTENDANCE TRACKER & ROLL-CALL */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-8">
          {/* Pending Excused Absences Panel with AUTO-MARK AE button */}
          <div className="rounded-xl border border-amber-500/30 bg-slate-900/90 p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Pending Excused Absence Requests</h3>
                  <p className="text-xs text-slate-400">
                    Cadet submissions requiring staff review. Click Auto-Mark AE to approve and log attendance in one step.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2.5 py-0.5 rounded self-start sm:self-auto">
                {pendingAbsences.length} Pending
              </span>
            </div>

            {pendingAbsences.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                All absence requests have been reviewed and resolved.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAbsences.map(ea => {
                  const cadet = profiles.find(p => p.id === ea.profile_id);
                  if (!cadet) return null;
                  return (
                    <div
                      key={ea.id}
                      className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-white">
                            <span className="text-amber-400">{cadet.rank}</span> {cadet.first_name} {cadet.last_name}
                          </span>
                          <span className="font-mono text-amber-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {ea.date_of_absence}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {cadet.instrument} · {cadet.cadet365_email}
                        </p>
                        <div className="mt-2 p-2.5 rounded bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                          "{ea.reason}"
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => reviewExcusedAbsence(ea.id, 'Rejected')}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAutoMarkAE(ea.id, `${cadet.rank} ${cadet.last_name}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-sm"
                          title="Approves request and marks attendance as Absent Excused (AE) for this date"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>Auto-Mark AE</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Roll-Call Interface */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
            {/* Controls Bar */}
            <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                    Select Rehearsal Date
                  </label>
                  <select
                    value={activeRehearsalDate}
                    onChange={e => setActiveRehearsalDate(e.target.value)}
                    className="px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  >
                    {rehearsalDates.map(d => (
                      <option key={d} value={d}>
                        {d} (Wednesday Parade)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <input
                    type="date"
                    value={newRehearsalInput}
                    onChange={e => setNewRehearsalInput(e.target.value)}
                    placeholder="New Date"
                    className="px-2.5 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-l-lg text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={() => {
                      if (newRehearsalInput) {
                        setActiveRehearsalDate(newRehearsalInput);
                        setNewRehearsalInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-r-lg text-xs font-medium border-y border-r border-slate-700"
                  >
                    Set Date
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => markAllPresentForDate(activeRehearsalDate)}
                  className="px-3 py-2 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mark All Present</span>
                </button>

                <button
                  onClick={handleExportCsv}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Attendance Roll Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Cadet Name & Rank</th>
                    <th className="px-4 py-3">Instrument</th>
                    <th className="px-4 py-3">Cadet365 Email</th>
                    <th className="px-4 py-3 text-center">Current Status</th>
                    <th className="px-6 py-3 text-right">Quick Mark Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {profiles
                    .filter(p => p.role === 'member')
                    .map(cadet => {
                      const currentStatus = attendanceMap[cadet.id];

                      let statusBadge = (
                        <span className="text-slate-500 font-mono text-[11px]">Unrecorded</span>
                      );

                      if (currentStatus === 'Present') {
                        statusBadge = (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                            Present
                          </span>
                        );
                      } else if (currentStatus === 'Late') {
                        statusBadge = (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-950 text-amber-300 border border-amber-800/60">
                            Late
                          </span>
                        );
                      } else if (currentStatus === 'Absent Excused - AE') {
                        statusBadge = (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/60">
                            Absent Excused - AE
                          </span>
                        );
                      } else if (currentStatus === 'Absent') {
                        statusBadge = (
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-950 text-rose-300 border border-rose-800/60">
                            Absent
                          </span>
                        );
                      }

                      return (
                        <tr key={cadet.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-3.5">
                            <span className="font-semibold text-amber-400 mr-1.5">{cadet.rank}</span>
                            <span className="text-white font-medium">
                              {cadet.first_name} {cadet.last_name}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-300">{cadet.instrument}</td>
                          <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">{cadet.cadet365_email}</td>
                          <td className="px-4 py-3.5 text-center">{statusBadge}</td>
                          <td className="px-6 py-3.5 text-right">
                            <div className="inline-flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                              {(['Present', 'Late', 'Absent', 'Absent Excused - AE'] as AttendanceStatus[]).map(st => {
                                const isSelected = currentStatus === st;
                                let label = 'P';
                                if (st === 'Late') label = 'L';
                                if (st === 'Absent') label = 'A';
                                if (st === 'Absent Excused - AE') label = 'AE';

                                return (
                                  <button
                                    key={st}
                                    onClick={() => markAttendance(cadet.id, activeRehearsalDate, st)}
                                    title={`Mark ${st}`}
                                    className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition-colors ${
                                      isSelected
                                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ROSTER MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          {/* Search, Filter & Sorters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={e => setRosterSearch(e.target.value)}
                  placeholder="Search name, rank, email..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Instrument Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <select
                  value={instrumentFilter}
                  onChange={e => setInstrumentFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Instruments ({profiles.length})</option>
                  {STANDARD_INSTRUMENTS.map(i => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sorters */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Sort by:</span>
              {(['last_name', 'first_name', 'rank', 'cadet365_email'] as SortField[]).map(field => {
                const isSelected = sortField === field;
                let label = 'Last Name';
                if (field === 'first_name') label = 'First Name';
                if (field === 'rank') label = 'Rank';
                if (field === 'cadet365_email') label = 'Cadet365';

                return (
                  <button
                    key={field}
                    onClick={() => handleSort(field)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {label} {isSelected && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Roster Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Cadet Member</th>
                    <th className="px-4 py-3.5">Rank</th>
                    <th className="px-4 py-3.5">Instrument</th>
                    <th className="px-4 py-3.5">Cadet365 Email</th>
                    <th className="px-4 py-3.5">Phone (Staff View)</th>
                    <th className="px-4 py-3.5 text-center">Attendance Rate</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {sortedProfiles.map(cadet => {
                    const stats = getCadetAttendanceStats(cadet.id);
                    return (
                      <tr key={cadet.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-white">
                            {cadet.first_name} {cadet.last_name}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {cadet.role === 'admin' ? 'Officer / Admin' : 'Cadet Musician'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40">
                            {cadet.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-200">{cadet.instrument}</td>
                        <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                          {cadet.cadet365_email}
                        </td>
                        <td className="px-4 py-3.5 text-slate-300 font-mono text-[11px]">
                          {cadet.phone || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`font-mono font-bold tabular-nums ${
                              stats.rate >= 80 ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {stats.rate}%
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            onClick={() => {
                              deleteMember(cadet.id);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REPERTOIRE & PART ASSIGNMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'music' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-amber-400" />
                <span>Repertoire & Instrument Part Assignments</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload instrument PDF parts to Supabase Storage and assign them to one or multiple cadet musicians.
              </p>
            </div>

            <button
              onClick={() => setIsUploadMusicOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shadow-md self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Song / Score Part</span>
            </button>
          </div>

          {/* Master Song List & Parts */}
          <div className="space-y-6">
            {sheetMusic.map(song => {
              const parts = songParts.filter(p => p.song_id === song.id);

              return (
                <div
                  key={song.id}
                  className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg"
                >
                  {/* Song Title Bar */}
                  <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{song.title}</h3>
                        <span className="text-xs text-slate-500 font-mono">
                          {parts.length} Part{parts.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <p className="text-xs italic text-slate-400 mt-0.5">Composer: {song.composer}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          deleteSong(song.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors text-xs flex items-center gap-1"
                        title="Delete Entire Song"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete Song</span>
                      </button>
                    </div>
                  </div>

                  {/* Song Parts Grid */}
                  <div className="p-4 sm:p-6 divide-y divide-slate-800/80">
                    {parts.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-500">
                        No instrument parts uploaded yet for this score.
                      </div>
                    ) : (
                      parts.map(part => {
                        const assignments = partAssignments.filter(
                          pa => pa.song_part_id === part.id
                        );
                        const assignedCadets = profiles.filter(p =>
                          assignments.some(a => a.profile_id === p.id)
                        );

                        return (
                          <div
                            key={part.id}
                            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{part.instrument_part}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  storage/sheet-music
                                </span>
                              </div>

                              {/* Cadet Assigned Badges */}
                              <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px]">
                                <span className="text-slate-400">Assigned Cadets:</span>
                                {assignedCadets.length === 0 ? (
                                  <span className="text-amber-400/80 italic">Unassigned</span>
                                ) : (
                                  assignedCadets.map(c => (
                                    <span
                                      key={c.id}
                                      className="px-2 py-0.5 rounded bg-blue-950 text-blue-200 border border-blue-800/60"
                                    >
                                      {c.rank} {c.last_name}
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Actions for Part */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() =>
                                  setPreviewScore({
                                    title: song.title,
                                    composer: song.composer,
                                    instrumentPart: part.instrument_part,
                                    fileUrl: part.file_url,
                                  })
                                }
                                className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                              >
                                Preview PDF
                              </button>

                              <button
                                onClick={() => setAssigningPartData({ part, song })}
                                className="px-3 py-1.5 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors"
                              >
                                Assign Cadets ({assignedCadets.length})
                              </button>

                              <button
                                onClick={() => {
                                  deleteSongPart(part.id);
                                }}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                                title="Delete Part"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
      />

      <UploadMusicModal
        isOpen={isUploadMusicOpen}
        onClose={() => setIsUploadMusicOpen(false)}
      />

      {assigningPartData && (
        <AssignPartModal
          isOpen={Boolean(assigningPartData)}
          onClose={() => setAssigningPartData(null)}
          part={assigningPartData.part}
          song={assigningPartData.song}
        />
      )}

      {previewScore && (
        <PdfViewerModal
          isOpen={Boolean(previewScore)}
          onClose={() => setPreviewScore(null)}
          title={previewScore.title}
          composer={previewScore.composer}
          instrumentPart={previewScore.instrumentPart}
          fileUrl={previewScore.fileUrl}
        />
      )}
    </div>
  );
};
