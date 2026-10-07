import React, { useState, useMemo } from 'react';
import {
  Music,
  Calendar,
  Users,
  Clock,
  User,
  LogOut,
  ChevronDown,
  Check,
  Search,
  Plus,
  Eye,
  Download,
  Send,
  CheckCircle,
  FileSpreadsheet,
  Trash2,
  Filter,
  ArrowUpDown,
  Zap,
  Shield,
  Phone,
  Mail,
  Award,
  ExternalLink,
  Settings,
  Database,
  ArrowLeft,
  X,
  KeyRound,
  Copy,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBandData } from '../context/BandDataContext';
import {
  CadetAssignedMusic,
  CADET_RANKS,
  STANDARD_INSTRUMENTS,
  CadetRank,
  AttendanceStatus,
  SheetMusic,
  SongPart,
  Profile,
  UserRole,
  isOfficerRank,
} from '../types/database';
import { SquadronCrest } from './SquadronCrest';
import { PdfViewerModal } from './PdfViewerModal';
import { AddMemberModal } from './AddMemberModal';
import { UploadMusicModal } from './UploadMusicModal';
import { AssignPartModal } from './AssignPartModal';
import { SquadronCalendarView } from './SquadronCalendarView';

interface MinimalDashboardProps {
  onLogout: () => void;
  onOpenSqlModal: () => void;
  onOpenSettingsModal: () => void;
}

export const MinimalDashboard: React.FC<MinimalDashboardProps> = ({
  onLogout,
  onOpenSqlModal,
  onOpenSettingsModal,
}) => {
  const {
    profile,
    role,
    isAdmin,
    availableProfiles,
    switchProfile,
    updateCurrentProfile,
    sendPasswordResetEmail,
    changePassword,
    deleteProfile,
  } = useAuth();
  const {
    profiles,
    updateMember,
    deleteMember,
    resetMemberPassword,
    sheetMusic,
    songParts,
    partAssignments,
    deleteSong,
    deleteSongPart,
    myAssignedMusic,
    visibleAttendance,
    getCadetAttendanceStats,
    attendanceRecords,
    markAttendance,
    markAllPresentForDate,
    clearAttendanceForDate,
    getAttendanceForDate,
    activeRehearsalDate,
    setActiveRehearsalDate,
    rehearsalDates,
    excusedAbsences,
    visibleExcusedAbsences,
    submitExcusedAbsence,
    reviewExcusedAbsence,
    autoMarkAE,
    updateExcusedAbsence,
    upsertExcusedAbsence,
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
  } = useBandData();

  // Active sub-tab depending on role
  const [memberTab, setMemberTab] = useState<'locker' | 'calendar' | 'attendance' | 'absence' | 'profile'>('locker');
  const [adminTab, setAdminTab] = useState<'rollcall' | 'calendar' | 'roster' | 'music' | 'my-parts' | 'profile'>('rollcall');

  // Delete Confirmation Modal State (Reliable in-app confirmation)
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{
    type: 'cadet' | 'song' | 'part' | 'calendar_event';
    id: string;
    title: string;
    subtitle?: string;
  } | null>(null);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);

  // Global Save Notification Pop-up
  const [saveToast, setSaveToast] = useState<{ id: string; title: string; message?: string } | null>(null);
  const showSaveToast = (title: string, message?: string) => {
    const id = Date.now().toString();
    setSaveToast({ id, title, message });
    setTimeout(() => {
      setSaveToast(curr => (curr?.id === id ? null : curr));
    }, 3500);
  };

  // AE View / Edit Modal for Admins on Roll Call
  const [aeModalData, setAeModalData] = useState<{
    cadet: Profile;
    date: string;
    reason: string;
    existingId?: string;
  } | null>(null);

  // Modals state
  const [activeScore, setActiveScore] = useState<CadetAssignedMusic | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isUploadMusicOpen, setIsUploadMusicOpen] = useState(false);
  const [assigningPartData, setAssigningPartData] = useState<{ part: SongPart; song: SheetMusic } | null>(null);
  const [selectedPartDetails, setSelectedPartDetails] = useState<{ part: SongPart; song: SheetMusic } | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Clickable Cadet Profile Modal (Admin)
  const [selectedCadetModal, setSelectedCadetModal] = useState<Profile | null>(null);
  const [cadetModalRank, setCadetModalRank] = useState<CadetRank>('Cdt');
  const [cadetModalInstrument, setCadetModalInstrument] = useState('');
  const [cadetModalEmail, setCadetModalEmail] = useState('');
  const [cadetModalFirstName, setCadetModalFirstName] = useState('');
  const [cadetModalLastName, setCadetModalLastName] = useState('');
  const [cadetModalPhone, setCadetModalPhone] = useState('');
  const [cadetModalRole, setCadetModalRole] = useState<UserRole>('member');
  const [cadetModalSuccess, setCadetModalSuccess] = useState<string | null>(null);
  const [resetEmailStatus, setResetEmailStatus] = useState<{ message: string; link?: string; success: boolean } | null>(null);
  const [copiedResetLink, setCopiedResetLink] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // Admin Profile Edit State
  const [adminRank, setAdminRank] = useState<CadetRank>(profile?.rank || 'Capt');
  const [adminInstrument, setAdminInstrument] = useState(profile?.instrument || 'Director of Music');
  const [adminEmail, setAdminEmail] = useState(profile?.cadet365_email || '');
  const [adminFirstName, setAdminFirstName] = useState(profile?.first_name || '');
  const [adminLastName, setAdminLastName] = useState(profile?.last_name || '');
  const [adminPhone, setAdminPhone] = useState(profile?.phone || '');
  const [adminProfileSuccess, setAdminProfileSuccess] = useState(false);

  // Search & Sorting controls for Roster & Roll Call
  const [musicSearch, setMusicSearch] = useState('');
  const [rosterSearch, setRosterSearch] = useState('');

  type SortCriteria = 'rank' | 'last_name' | 'instrument';
  const [rosterSortKey, setRosterSortKey] = useState<SortCriteria>('rank');
  const [rosterSortDir, setRosterSortDir] = useState<'asc' | 'desc'>('desc');

  const [rollCallSortKey, setRollCallSortKey] = useState<SortCriteria>('rank');
  const [rollCallSortDir, setRollCallSortDir] = useState<'asc' | 'desc'>('desc');

  // Military rank weight order: Officers -> Senior NCOs -> Junior NCOs -> Cadets
  const RANK_ORDER: Record<string, number> = {
    'Maj': 15,
    'Capt': 14,
    'Lt': 13,
    '2Lt': 12,
    'OCdt': 11,
    'CI': 10,
    'CV': 9,
    'WO1': 8,
    'WO2': 7,
    'FSgt': 6,
    'Sgt': 5,
    'FCpl': 4,
    'Cpl': 3,
    'LAC': 2,
    'Cdt': 1,
  };

  // Absence Form state
  const [absenceDate, setAbsenceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [absenceReason, setAbsenceReason] = useState('');
  const [absenceSuccess, setAbsenceSuccess] = useState(false);

  // Profile Edit state
  const [editRank, setEditRank] = useState(profile?.rank || 'Cdt');
  const [editInstrument, setEditInstrument] = useState(profile?.instrument || 'Clarinet');
  const [editPhone, setEditPhone] = useState(profile?.phone || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Notification for Auto-Mark AE
  const [autoMarkAlert, setAutoMarkAlert] = useState<string | null>(null);

  const attendanceStats = profile ? getCadetAttendanceStats(profile.id) : null;
  const attendanceMap = profile ? getAttendanceForDate(activeRehearsalDate) : {};
  const pendingAbsences = excusedAbsences.filter(ea => ea.status === 'Pending');

  // Filtered music for member
  const filteredMusic = myAssignedMusic.filter(
    m =>
      m.title.toLowerCase().includes(musicSearch.toLowerCase()) ||
      m.instrumentPart.toLowerCase().includes(musicSearch.toLowerCase())
  );

  // Cadets for Attendance Roll Call: include admins as well as non-officer personnel
  const attendanceCadets = useMemo(() => {
    let list = profiles.filter(p => p.role === 'admin' || !isOfficerRank(p.rank));
    list.sort((a, b) => {
      if (rollCallSortKey === 'rank') {
        const wa = RANK_ORDER[a.rank] ?? 0;
        const wb = RANK_ORDER[b.rank] ?? 0;
        const diff = rollCallSortDir === 'desc' ? wb - wa : wa - wb;
        return diff !== 0 ? diff : a.last_name.localeCompare(b.last_name);
      }
      if (rollCallSortKey === 'last_name') {
        const cmp = a.last_name.localeCompare(b.last_name);
        return rollCallSortDir === 'asc' ? cmp : -cmp;
      }
      if (rollCallSortKey === 'instrument') {
        const cmp = a.instrument.localeCompare(b.instrument);
        return rollCallSortDir === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
    return list;
  }, [profiles, rollCallSortKey, rollCallSortDir]);

  // Sorted roster for admin (all band personnel: cadets + officers)
  const sortedRoster = useMemo(() => {
    let list = [...profiles];
    if (rosterSearch.trim()) {
      const q = rosterSearch.toLowerCase();
      list = list.filter(
        p =>
          p.first_name.toLowerCase().includes(q) ||
          p.last_name.toLowerCase().includes(q) ||
          p.instrument.toLowerCase().includes(q) ||
          p.cadet365_email.toLowerCase().includes(q) ||
          p.rank.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (rosterSortKey === 'rank') {
        const wa = RANK_ORDER[a.rank] ?? 0;
        const wb = RANK_ORDER[b.rank] ?? 0;
        const diff = rosterSortDir === 'desc' ? wb - wa : wa - wb;
        return diff !== 0 ? diff : a.last_name.localeCompare(b.last_name);
      }
      if (rosterSortKey === 'last_name') {
        const cmp = a.last_name.localeCompare(b.last_name);
        return rosterSortDir === 'asc' ? cmp : -cmp;
      }
      if (rosterSortKey === 'instrument') {
        const cmp = a.instrument.localeCompare(b.instrument);
        return rosterSortDir === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
    return list;
  }, [profiles, rosterSearch, rosterSortKey, rosterSortDir]);

  if (!profile) return null;

  const handleMemberProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCurrentProfile({
      phone: editPhone.trim() || null,
    });
    setProfileSuccess(true);
    showSaveToast('Profile Saved', 'Your contact phone number has been updated.');
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleAdminProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCurrentProfile({
      first_name: adminFirstName.trim(),
      last_name: adminLastName.trim(),
      rank: adminRank,
      instrument: adminInstrument,
      cadet365_email: adminEmail.trim(),
      phone: adminPhone.trim() || null,
    });
    setAdminProfileSuccess(true);
    showSaveToast('Profile Saved', 'Officer credentials and records updated successfully.');
    setTimeout(() => setAdminProfileSuccess(false), 3000);
  };

  const handleOpenCadetModal = (cadet: Profile) => {
    setSelectedCadetModal(cadet);
    setCadetModalRank(cadet.rank);
    setCadetModalInstrument(cadet.instrument);
    setCadetModalEmail(cadet.cadet365_email);
    setCadetModalFirstName(cadet.first_name);
    setCadetModalLastName(cadet.last_name);
    setCadetModalPhone(cadet.phone || '');
    setCadetModalRole(cadet.role);
    setCadetModalSuccess(null);
    setResetEmailStatus(null);
    setCopiedResetLink(false);
    setPasswordMessage('');
  };

  const handleSaveCadetModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCadetModal) return;
    const cadetFullName = `${cadetModalRank} ${cadetModalFirstName.trim()} ${cadetModalLastName.trim()}`;
    const ok = await updateMember(selectedCadetModal.id, {
      rank: cadetModalRank,
      instrument: cadetModalInstrument,
      cadet365_email: cadetModalEmail.trim(),
      first_name: cadetModalFirstName.trim(),
      last_name: cadetModalLastName.trim(),
      phone: cadetModalPhone.trim() || null,
      role: cadetModalRole,
    });
    if (ok) {
      setSelectedCadetModal(null);
      showSaveToast('Record Saved Successfully', `${cadetFullName}'s profile records have been saved.`);
    }
  };

  const handleOpenAeModal = (cadet: Profile) => {
    const existing = excusedAbsences.find(
      ea => ea.profile_id === cadet.id && ea.date_of_absence === activeRehearsalDate
    );
    setAeModalData({
      cadet,
      date: activeRehearsalDate,
      reason: existing ? existing.reason : 'Authorized Excused (AE) approved by Band Officer.',
      existingId: existing?.id,
    });
  };

  const handleSaveAeModal = async () => {
    if (!aeModalData) return;
    const finalReason = aeModalData.reason.trim() || 'Excused absence approved by Band Command.';
    await upsertExcusedAbsence(aeModalData.cadet.id, aeModalData.date, finalReason);
    await markAttendance(aeModalData.cadet.id, aeModalData.date, 'Absent Excused - AE');
    showSaveToast(
      'AE Info Saved',
      `Excused absence record for ${aeModalData.cadet.rank} ${aeModalData.cadet.last_name} on ${aeModalData.date} saved.`
    );
    setAeModalData(null);
  };

  const handleSendPasswordReset = async () => {
    if (!selectedCadetModal) return;
    const res = await sendPasswordResetEmail(selectedCadetModal.cadet365_email);
    setResetEmailStatus({ message: res.message, link: res.resetLink, success: true });
  };

  const handleAdminPasswordReset = async () => {
    if (!selectedCadetModal) return;
    const password = window.prompt('Enter the default password you want to assign to this member (minimum 8 characters):');
    if (!password) return;
    const res = await resetMemberPassword(selectedCadetModal.id, password);
    setResetEmailStatus({ message: res.success ? 'Password reset successfully. Give the member the password you entered.' : (res.error || 'Password reset failed.'), link: '', success: res.success });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    if (!currentPassword) {
      setPasswordMessage('Enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match.');
      return;
    }
    const res = await changePassword(currentPassword, newPassword);
    if (!res.success) {
      setPasswordMessage(res.error || 'Unable to change password.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setChangePasswordOpen(false);
    setPasswordMessage('Password changed successfully.');
  };

  const handleCopyResetLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedResetLink(true);
    setTimeout(() => setCopiedResetLink(false), 2500);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    const { type, id, title } = deleteConfirmItem;
    if (type === 'cadet') {
      await deleteMember(id);
      deleteProfile(id);
      if (selectedCadetModal?.id === id) {
        setSelectedCadetModal(null);
      }
      setDeleteToast(`Removed cadet ${title} from roster`);
    } else if (type === 'song') {
      await deleteSong(id);
      setDeleteToast(`Deleted song '${title}' and its parts`);
    } else if (type === 'part') {
      await deleteSongPart(id);
      setDeleteToast(`Deleted part '${title}'`);
    } else if (type === 'calendar_event') {
      await deleteCalendarEvent(id);
      setDeleteToast(`Removed event '${title}' from calendar`);
    }
    setDeleteConfirmItem(null);
    setTimeout(() => setDeleteToast(null), 4000);
  };

  const handleAbsenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!absenceReason.trim()) return;
    const ok = await submitExcusedAbsence(absenceDate, absenceReason);
    if (ok) {
      setAbsenceSuccess(true);
      setAbsenceReason('');
      setTimeout(() => setAbsenceSuccess(false), 3500);
    }
  };

  const handleAutoMarkAE = async (absenceId: string, cadetName: string) => {
    const ok = await autoMarkAE(absenceId);
    if (ok) {
      setAutoMarkAlert(`Approved and marked AE for ${cadetName}.`);
      setTimeout(() => setAutoMarkAlert(null), 3500);
    }
  };

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

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `888_Avenger_Attendance_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-body">
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SquadronCrest size="sm" />
            <div>
              <span className="font-heading font-black text-sm text-slate-900 leading-tight block">
                <span className="font-squadron-num text-sky-600 font-black mr-1">888</span>
                Avenger Band
              </span>
              <span className="text-[11px] text-sky-600 font-mono font-medium block">
                Phantom Flight · Vancouver, BC
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSettingsModal}
              title="Database Settings"
              className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-slate-200"
            >
              <Settings className="w-4 h-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition-colors text-xs font-semibold text-slate-800"
              >
                <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-[11px] font-bold">
                  {profile.first_name[0]}
                </div>
                <span className="hidden sm:inline">
                  <span className="text-sky-700 mr-1">{profile.rank}</span>
                  {profile.last_name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-600 font-mono border border-slate-200 uppercase">
                  {role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">
                      {profile.rank} {profile.first_name} {profile.last_name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      {profile.cadet365_email}
                    </p>
                  </div>

                  <div className="py-1">
                    <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Cadet Account
                    </p>
                    {availableProfiles.slice(0, 4).map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          switchProfile(p.id);
                          setIsProfileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-left ${
                          p.id === profile.id
                            ? 'bg-sky-50 text-sky-800 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{p.rank} {p.last_name} ({p.role})</span>
                        {p.id === profile.id && <Check className="w-3.5 h-3.5 text-sky-600" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onLogout}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 uppercase">
                {role === 'admin' ? 'Admin (Officer / Band Senior)' : 'Cadet Musician'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {profile.instrument}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Welcome, {profile.rank} {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              888 Avenger Royal Canadian Air Cadet Squadron Band · Walter Moberly Elementary, Vancouver
            </p>
          </div>

          {role === 'member' ? (
            <div className="flex items-center gap-4 sm:border-l sm:border-slate-100 sm:pl-6 text-xs font-mono">
              <div>
                <p className="text-slate-400 text-[11px]">Attendance</p>
                <p className="text-xl font-bold text-sky-600 tabular-nums">
                  {attendanceStats.rate}%
                </p>
              </div>
              <div className="border-l border-slate-100 pl-4">
                <p className="text-slate-400 text-[11px]">Music Parts</p>
                <p className="text-xl font-bold text-slate-800 tabular-nums">
                  {myAssignedMusic.length}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 sm:border-l sm:border-slate-100 sm:pl-6 text-xs font-mono">
              <div>
                <p className="text-slate-400 text-[11px]">Roster</p>
                <p className="text-xl font-bold text-slate-800 tabular-nums">
                  {profiles.length}
                </p>
              </div>
              <div className="border-l border-slate-100 pl-4">
                <p className="text-slate-400 text-[11px]">Pending Absences</p>
                <p className="text-xl font-bold text-amber-600 tabular-nums">
                  {pendingAbsences.length}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
          {role === 'member' ? (
            <>
              {[
                { id: 'locker', label: 'Sheet Music Locker', icon: Music, count: myAssignedMusic.length },
                { id: 'calendar', label: 'Squadron Calendar', icon: Calendar, count: calendarEvents.length },
                { id: 'attendance', label: 'My Attendance', icon: CheckCircle, count: `${attendanceStats.rate}%` },
                { id: 'absence', label: 'Excused Absence', icon: Clock, count: visibleExcusedAbsences.length },
                { id: 'profile', label: 'My Profile', icon: User },
              ].map(t => {
                const Icon = t.icon;
                const isActive = memberTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setMemberTab(t.id as any)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                    {t.count !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          isActive ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          ) : (
            <>
              {[
                { id: 'rollcall', label: 'Roll-Call & Absences', icon: CheckCircle, count: pendingAbsences.length },
                { id: 'calendar', label: 'Calendar & Dates', icon: Calendar, count: calendarEvents.length },
                { id: 'roster', label: 'Roster', icon: Users, count: profiles.length },
                { id: 'music', label: 'Music & Parts Manager', icon: Music, count: sheetMusic.length },
                { id: 'my-parts', label: 'My Parts', icon: Music, count: myAssignedMusic.length },
                { id: 'profile', label: 'Admin / Officer Profile', icon: User },
              ].map(t => {
                const Icon = t.icon;
                const isActive = adminTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setAdminTab(t.id as any)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                    {t.count !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          isActive ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>

        {role === 'member' && memberTab === 'locker' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900">
                Assigned Sheet Music ({filteredMusic.length})
              </h2>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={musicSearch}
                  onChange={e => setMusicSearch(e.target.value)}
                  placeholder="Search music..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {filteredMusic.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                <Music className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No sheet music assigned yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Band Officers will assign parts according to your instrument.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMusic.map(item => (
                  <div
                    key={item.assignmentId}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-sky-300 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
                          {item.instrumentPart}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">PDF Score</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                      <p className="text-xs text-slate-500 italic mt-0.5">{item.composer}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => setActiveScore(item)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View PDF</span>
                      </button>

                      <a
                        href={item.fileUrl}
                        download={`${item.title}_${item.instrumentPart}.pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-slate-50 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {role === 'admin' && adminTab === 'my-parts' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900">
                My Assigned Parts ({myAssignedMusic.length})
              </h2>
            </div>

            {myAssignedMusic.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                <Music className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No parts assigned yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Band officers can assign your parts here when ready.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myAssignedMusic.map(item => (
                  <div
                    key={item.assignmentId}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-sky-300 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
                          {item.instrumentPart}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">PDF Score</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                      <p className="text-xs text-slate-500 italic mt-0.5">{item.composer}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => setActiveScore(item)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View PDF</span>
                      </button>

                      <a
                        href={item.fileUrl}
                        download={`${item.title}_${item.instrumentPart}.pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-slate-50 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {role === 'admin' && adminTab === 'profile' && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-sky-600" />
                <span>Admin / Officer / Band Senior Profile</span>
              </h2>
            </div>

            {adminProfileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Officer credentials and profile records saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleAdminProfileSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={adminFirstName}
                    onChange={e => setAdminFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={adminLastName}
                    onChange={e => setAdminLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Cadet365 Email *</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Rank</label>
                  <select
                    value={adminRank}
                    onChange={e => setAdminRank(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    {CADET_RANKS.map(r => (
                      <option key={r.value} value={r.value}>
                        {r.label} ({r.fullTitle})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Instrument / Role</label>
                  <select
                    value={adminInstrument}
                    onChange={e => setAdminInstrument(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
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
                <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={adminPhone}
                  onChange={e => setAdminPhone(e.target.value)}
                  placeholder="(604) 555-0100"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Change Admin Profile
              </button>

              <button
                type="button"
                onClick={() => { setPasswordMessage(''); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setChangePasswordOpen(true); }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Change Password
              </button>
            </form>
          </div>
        )}

        {role === 'member' && memberTab === 'profile' && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-sky-600" />
                <span>My Profile</span>
              </h2>
            </div>

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Profile saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleMemberProfileSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">First Name</label>
                  <input type="text" value={profile.first_name} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500" />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Last Name</label>
                  <input type="text" value={profile.last_name} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500" />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Account Email</label>
                <input type="email" value={profile.cadet365_email} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-mono" />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="(604) 555-0100" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500" />
              </div>
              <button type="submit" className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-sm">
                Save Profile
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setPasswordMessage(''); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setChangePasswordOpen(true); }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Change Password
              </button>
            </div>
          </div>
        )}

        {role === 'admin' && adminTab === 'rollcall' && (
          <div className="space-y-6">
            {autoMarkAlert && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                <span>{autoMarkAlert}</span>
                <button onClick={() => setAutoMarkAlert(null)} className="text-emerald-600">✕</button>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span>Pending Absence Requests ({pendingAbsences.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400">Click Auto-Mark AE to approve in one step</span>
              </div>

              {pendingAbsences.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No pending absence requests.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pendingAbsences.map(ea => {
                    const cadet = profiles.find(p => p.id === ea.profile_id);
                    if (!cadet) return null;
                    return (
                      <div key={ea.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {cadet.rank} {cadet.last_name}
                          </span>
                          <span className="font-mono text-sky-700 bg-sky-100 px-2 py-0.5 rounded font-semibold">
                            {ea.date_of_absence}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">"{ea.reason}"</p>
                        <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                          <button
                            onClick={() => reviewExcusedAbsence(ea.id, 'Rejected')}
                            className="px-2 py-1 text-[11px] text-slate-500 hover:text-rose-600"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleAutoMarkAE(ea.id, `${cadet.rank} ${cadet.last_name}`)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Auto-Mark AE</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center gap-2.5 bg-slate-50/50">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-xs font-semibold text-slate-600">Rehearsal Date:</label>
                  <select
                    value={activeRehearsalDate}
                    onChange={e => setActiveRehearsalDate(e.target.value)}
                    className="px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    {rehearsalDates.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setAdminTab('calendar')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-200 text-sky-700 bg-sky-50 hover:bg-sky-100 text-xs font-semibold transition-colors"
                    title="View and schedule dates on the Squadron Calendar"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Calendar / Add Dates</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 text-xs shadow-xs">
                  <span className="text-[11px] text-slate-500 font-medium px-1.5">Sort by:</span>
                  {(['rank', 'last_name', 'instrument'] as const).map(criterion => {
                    const active = rollCallSortKey === criterion;
                    const label = criterion === 'rank' ? 'Rank' : criterion === 'last_name' ? 'Last Name' : 'Instrument';
                    return (
                      <button
                        key={criterion}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setRollCallSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
                          } else {
                            setRollCallSortKey(criterion);
                            setRollCallSortDir(criterion === 'rank' ? 'desc' : 'asc');
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                          active
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <span>{label}</span>
                        {active && <span className="text-[9px]">{rollCallSortDir === 'asc' ? '▲' : '▼'}</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 flex-wrap ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      markAllPresentForDate(activeRehearsalDate);
                      showSaveToast(
                        'Attendance Updated',
                        `All personnel marked Present for ${activeRehearsalDate}.`
                      );
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark All Present</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const success = await clearAttendanceForDate(activeRehearsalDate);

                      if (success) {
                        showSaveToast(
                          'Attendance Cleared',
                          `Present, Late, and Absent records cleared for ${activeRehearsalDate}. AE records were kept.`
                        );
                      } else {
                        showSaveToast(
                          'Attendance Error',
                          'Attendance could not be cleared.'
                        );
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
                  >
                    <span>Clear Attendance</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-600" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="px-5 py-3">Cadet (Click for Details)</th>
                      <th className="px-4 py-3">Instrument</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-right">Quick Mark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceCadets.map(cadet => {
                      const status = attendanceMap[cadet.id];
                      return (
                        <tr key={cadet.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <button
                              type="button"
                              onClick={() => handleOpenCadetModal(cadet)}
                              className="text-left group flex items-center gap-2 hover:opacity-90 transition-opacity"
                              title="Click to view & edit cadet profile"
                            >
                              <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-sky-100 text-slate-700 group-hover:text-sky-700 flex items-center justify-center text-[10px] font-bold">
                                {cadet.first_name[0]}
                              </div>
                              <div>
                                <span className="font-semibold text-sky-700 mr-1.5">{cadet.rank}</span>
                                <span className="font-bold text-slate-900 group-hover:text-sky-700 group-hover:underline transition-colors">
                                  {cadet.first_name} {cadet.last_name}
                                </span>
                              </div>
                            </button>
                          </td>
                          <td className="px-4 py-3.5 text-slate-500">{cadet.instrument}</td>
                          <td className="px-4 py-3.5 text-center">
                            {status ? (
                              status === 'Absent Excused - AE' ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenAeModal(cadet)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 hover:text-sky-900 transition-colors"
                                  title="Click to view or edit AE reason / notes"
                                >
                                  <span>Absent Excused - AE</span>
                                  <span className="text-[9px] underline font-semibold group-hover:text-sky-900">(Edit)</span>
                                </button>
                              ) : (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    status === 'Present'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : status === 'Late'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {status}
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400 font-mono text-[10px]">Unrecorded</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                              {(['Present', 'Late', 'Absent', 'Absent Excused - AE'] as AttendanceStatus[]).map(st => {
                                const isSel = status === st;
                                let lbl = 'P';
                                if (st === 'Late') lbl = 'L';
                                if (st === 'Absent') lbl = 'A';
                                if (st === 'Absent Excused - AE') lbl = 'AE';
                                return (
                                  <button
                                    key={st}
                                    onClick={async () => {
                                      const success = await markAttendance(cadet.id, activeRehearsalDate, st);
                                      if (!success) {
                                        showSaveToast('Attendance Error', 'Attendance could not be saved. Check the Supabase permissions or console error.');
                                        return;
                                      }
                                      if (st === 'Absent Excused - AE') {
                                        handleOpenAeModal(cadet);
                                      } else {
                                        showSaveToast('Attendance Recorded', `${cadet.rank} ${cadet.last_name} marked ${st}.`);
                                      }
                                    }}
                                    title={st}
                                    className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition-colors ${
                                      isSel
                                        ? 'bg-sky-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                  >
                                    {lbl}
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

        {role === 'admin' && adminTab === 'calendar' && (
          <SquadronCalendarView
            isAdmin={true}
            calendarEvents={calendarEvents}
            onAddEvent={addCalendarEvent}
            onDeleteEvent={(id, title, subtitle) => {
              setDeleteConfirmItem({ type: 'calendar_event', id, title, subtitle });
            }}
            onSelectRehearsalDate={date => {
              setActiveRehearsalDate(date);
              setAdminTab('rollcall');
            }}
          />
        )}

        {role === 'admin' && adminTab === 'roster' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap flex-1">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={rosterSearch}
                    onChange={e => setRosterSearch(e.target.value)}
                    placeholder="Search roster..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 text-xs shadow-xs">
                  <span className="text-[11px] text-slate-500 font-medium px-1.5">Sort by:</span>
                  {(['rank', 'last_name', 'instrument'] as const).map(criterion => {
                    const active = rosterSortKey === criterion;
                    const label = criterion === 'rank' ? 'Rank' : criterion === 'last_name' ? 'Last Name' : 'Instrument';
                    return (
                      <button
                        key={criterion}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setRosterSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
                          } else {
                            setRosterSortKey(criterion);
                            setRosterSortDir(criterion === 'rank' ? 'desc' : 'asc');
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                          active
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <span>{label}</span>
                        {active && <span className="text-[9px]">{rosterSortDir === 'asc' ? '▲' : '▼'}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => { setSaveToast(null); setIsAddMemberOpen(true); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition-colors self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-slate-500 font-medium">
                Showing {sortedRoster.length} registered band personnel · <span className="text-sky-700 font-semibold">Click any member profile to edit rank/email or dispatch password reset</span>
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Instrument</th>
                    <th className="px-4 py-3">Cadet365 / Defense Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedRoster.map(cadet => (
                    <tr
                      key={cadet.id}
                      onClick={() => handleOpenCadetModal(cadet)}
                      className="hover:bg-sky-50/70 cursor-pointer transition-colors group"
                      title="Click to view & edit cadet profile or send password reset"
                    >
                      <td className="px-5 py-3.5 font-bold text-slate-900 group-hover:text-sky-700 transition-colors flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-sky-100 text-slate-700 group-hover:text-sky-700 flex items-center justify-center text-[10px] font-bold">
                          {cadet.first_name[0]}
                        </div>
                        <span>{cadet.first_name} {cadet.last_name}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded text-[11px] font-bold">
                          {cadet.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{cadet.instrument}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">{cadet.cadet365_email}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">{cadet.phone || '—'}</td>
                      <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirmItem({
                              type: 'cadet',
                              id: cadet.id,
                              title: `${cadet.rank} ${cadet.first_name} ${cadet.last_name}`,
                              subtitle: `Cadet365: ${cadet.cadet365_email} · Instrument: ${cadet.instrument}`,
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove cadet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {role === 'admin' && adminTab === 'music' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Sheet Music Catalog & Assignments ({sheetMusic.length} songs)
              </h2>
              <button
                onClick={() => setIsUploadMusicOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Song Part</span>
              </button>
            </div>

            <div className="space-y-4">
              {sheetMusic.map(song => {
                const parts = songParts.filter(sp => sp.song_id === song.id);
                return (
                  <div key={song.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{song.title}</h3>
                        <p className="text-xs text-slate-500 italic">Composer: {song.composer}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirmItem({
                            type: 'song',
                            id: song.id,
                            title: song.title,
                            subtitle: `Composer: ${song.composer} · All parts and cadet assignments will be removed`,
                          });
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete song"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-4 divide-y divide-slate-100">
                      {parts.map(part => {
                        const assignments = partAssignments.filter(pa => pa.song_part_id === part.id);
                        return (
                          <div key={part.id} className="py-2.5 flex items-center justify-between text-xs">
                            <button type="button" onClick={() => setSelectedPartDetails({ part, song })} className="text-left flex-1 min-w-0 group" title="Click to view assigned musicians and preview this part">
                              <span className="font-semibold text-slate-900 group-hover:text-sky-700 group-hover:underline transition-colors">{part.instrument_part}</span>
                              <span className="ml-2 text-[11px] text-slate-400">
                                ({assignments.length} cadet{assignments.length === 1 ? '' : 's'} assigned)
                              </span>
                              <span className="ml-2 text-[10px] text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity">Click for details</span>
                            </button>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setAssigningPartData({ part, song })}
                                className="px-2.5 py-1 text-xs rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold"
                              >
                                Assign Cadets
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteConfirmItem({
                                    type: 'part',
                                    id: part.id,
                                    title: `${song.title} (${part.instrument_part})`,
                                    subtitle: `Will remove this part and unassign ${assignments.length} assigned cadet(s)`,
                                  });
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete song part"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

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

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
      />

      <UploadMusicModal
        isOpen={isUploadMusicOpen}
        onClose={() => setIsUploadMusicOpen(false)}
      />

      {selectedPartDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide font-bold text-sky-600">Sheet Music Part</p>
                <h3 className="text-base font-bold text-slate-900 truncate">{selectedPartDetails.part.instrument_part}</h3>
                <p className="text-xs text-slate-500 italic truncate">{selectedPartDetails.song.title} · {selectedPartDetails.song.composer}</p>
              </div>
              <button type="button" onClick={() => setSelectedPartDetails(null)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-600" /> Assigned Musicians
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-100 px-2 py-1 rounded-full">
                    {partAssignments.filter(pa => pa.song_part_id === selectedPartDetails.part.id).length}
                  </span>
                </div>
                {partAssignments.filter(pa => pa.song_part_id === selectedPartDetails.part.id).length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No musicians are assigned to this part yet.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {partAssignments.filter(pa => pa.song_part_id === selectedPartDetails.part.id).map(assignment => {
                      const assignedProfile = profiles.find(p => p.id === assignment.profile_id);
                      if (!assignedProfile) return null;
                      return (
                        <div key={assignment.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{assignedProfile.rank} {assignedProfile.first_name} {assignedProfile.last_name}</p>
                            <p className="text-[10px] text-slate-500">{assignedProfile.instrument}</p>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400">{assignedProfile.role === 'admin' ? 'Admin' : 'Cadet'}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Part Preview</p>
                  <p className="text-[10px] text-slate-400">Open the uploaded PDF to see exactly what this part looks like.</p>
                </div>
                <button type="button" onClick={() => {
                  const part = selectedPartDetails.part;
                  const song = selectedPartDetails.song;
                  setSelectedPartDetails(null);
                  setActiveScore({
                    assignmentId: 'admin-preview-' + part.id,
                    partId: part.id,
                    songId: song.id,
                    title: song.title,
                    composer: song.composer,
                    instrumentPart: part.instrument_part,
                    fileUrl: part.file_url,
                    assignedAt: part.created_at,
                  });
                }} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold">
                  <Eye className="w-3.5 h-3.5" /> View PDF
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button type="button" onClick={() => setAssigningPartData(selectedPartDetails)} className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold">
                  Manage Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {assigningPartData && (
        <AssignPartModal
          isOpen={Boolean(assigningPartData)}
          onClose={() => setAssigningPartData(null)}
          part={assigningPartData.part}
          song={assigningPartData.song}
        />
      )}

      {selectedCadetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                  {selectedCadetModal.first_name[0]}{selectedCadetModal.last_name[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedCadetModal.rank} {selectedCadetModal.first_name} {selectedCadetModal.last_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedCadetModal.role === 'admin' ? 'Admin (Officer / Band Senior)' : 'Cadet Musician'} · {selectedCadetModal.instrument}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCadetModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {cadetModalSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{cadetModalSuccess}</span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                      <span>Cadet Portal Security & Access</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Set a temporary password for this member. They can change it after signing in.
                    </p>
                  </div>
                  <button type="button" onClick={handleAdminPasswordReset} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-sm transition-colors whitespace-nowrap">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Set Temporary Password</span>
                  </button>
                </div>

                {resetEmailStatus && (
                  <div className={`p-3 bg-white rounded-lg border text-xs space-y-2 ${resetEmailStatus.success ? 'border-emerald-200' : 'border-rose-200'}`}>
                    <div className={`flex items-center gap-2 font-semibold ${resetEmailStatus.success ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {resetEmailStatus.success ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                      <span>{resetEmailStatus.message}</span>
                    </div>
                    {resetEmailStatus.link && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={resetEmailStatus.link}
                          className="flex-1 px-2.5 py-1 text-[11px] font-mono bg-slate-50 border border-slate-200 rounded text-slate-600 select-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopyResetLink(resetEmailStatus.link!)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[11px] font-medium text-slate-700 flex items-center gap-1 transition-colors"
                        >
                          {copiedResetLink ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cadet Attendance Summary */}
{selectedCadetModal && (() => {
  const cadetAttendanceStats = getCadetAttendanceStats(selectedCadetModal.id);
  const cadetAttendanceRecords = attendanceRecords
    .filter(r => r.profile_id === selectedCadetModal.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900 text-xs">
            Attendance
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Complete attendance record for this cadet.
          </p>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-sky-700">
            {cadetAttendanceStats.rate}%
          </div>
          <div className="text-[10px] text-slate-500">
            Attendance Rate
          </div>
        </div>
      </div>

      {/* Attendance Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
          <div className="text-sm font-bold text-slate-900">
            {cadetAttendanceStats.total}
          </div>
          <div className="text-[10px] text-slate-500">
            Total
          </div>
        </div>

        <div className="p-2.5 bg-white rounded-lg border border-emerald-200 text-center">
          <div className="text-sm font-bold text-emerald-700">
            {cadetAttendanceStats.present}
          </div>
          <div className="text-[10px] text-slate-500">
            P — Present
          </div>
        </div>

        <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-center">
          <div className="text-sm font-bold text-amber-700">
            {cadetAttendanceStats.late}
          </div>
          <div className="text-[10px] text-slate-500">
            L — Late
          </div>
        </div>

        <div className="p-2.5 bg-white rounded-lg border border-red-200 text-center">
          <div className="text-sm font-bold text-red-700">
            {cadetAttendanceStats.absent}
          </div>
          <div className="text-[10px] text-slate-500">
            A — Absent
          </div>
        </div>

        <div className="p-2.5 bg-white rounded-lg border border-sky-200 text-center">
          <div className="text-sm font-bold text-sky-700">
            {cadetAttendanceStats.excused}
          </div>
          <div className="text-[10px] text-slate-500">
            AE — Excused
          </div>
        </div>
      </div>

      {/* Day-by-Day Attendance Log */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h5 className="font-semibold text-slate-800 text-xs">
            Day-by-Day Log
          </h5>
          <span className="text-[10px] text-slate-400">
            {cadetAttendanceRecords.length} recorded
          </span>
        </div>

        {cadetAttendanceRecords.length === 0 ? (
          <div className="p-4 bg-white rounded-lg border border-slate-200 text-center text-[11px] text-slate-500">
            No attendance records have been logged for this cadet.
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {cadetAttendanceRecords.map(record => {
              const statusConfig = {
                'Present': {
                  label: 'P',
                  text: 'Present',
                  className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                },
                'Late': {
                  label: 'L',
                  text: 'Late',
                  className: 'bg-amber-50 text-amber-700 border-amber-200',
                },
                'Absent': {
                  label: 'A',
                  text: 'Absent',
                  className: 'bg-red-50 text-red-700 border-red-200',
                },
                'Absent Excused - AE': {
                  label: 'AE',
                  text: 'Absent Excused',
                  className: 'bg-sky-50 text-sky-700 border-sky-200',
                },
              }[record.status];

              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between px-3 py-2.5"
                >
                  <div>
                    <div className="font-medium text-slate-800 text-[11px]">
                      {new Date(`${record.date}T00:00:00`).toLocaleDateString(
                        'en-CA',
                        {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Attendance Record
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold ${
                      statusConfig?.className ||
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span>{statusConfig?.label || record.status}</span>
                    {statusConfig?.text && (
                      <span className="font-medium">
                        {statusConfig.text}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
})()}
              
              <form onSubmit={handleSaveCadetModal} className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-xs">
                    Official Cadet Records (Admin Controlled)
                  </h4>
                  <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Squadron Musician
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={cadetModalFirstName}
                      onChange={e => setCadetModalFirstName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={cadetModalLastName}
                      onChange={e => setCadetModalLastName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Rank *</label>
                    <select
                      value={cadetModalRank}
                      onChange={e => setCadetModalRank(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                    >
                      {CADET_RANKS.map(r => (
                        <option key={r.value} value={r.value}>
                          {r.label} ({r.fullTitle})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Instrument *</label>
                    <select
                      value={cadetModalInstrument}
                      onChange={e => setCadetModalInstrument(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
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
                  <label className="block font-medium text-slate-700 mb-1">Cadet365 Email *</label>
                  <input
                    type="email"
                    required
                    value={cadetModalEmail}
                    onChange={e => setCadetModalEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={cadetModalPhone}
                      onChange={e => setCadetModalPhone(e.target.value)}
                      placeholder="(604) 555-0100"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Portal Role</label>
                    <select
                      value={cadetModalRole}
                      onChange={e => setCadetModalRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                    >
                      <option value="member">Cadet Musician</option>
                      <option value="admin">Admin (Officer / Band Senior)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmItem({
                        type: 'cadet',
                        id: selectedCadetModal.id,
                        title: `${selectedCadetModal.rank} ${selectedCadetModal.first_name} ${selectedCadetModal.last_name}`,
                        subtitle: `Cadet365: ${selectedCadetModal.cadet365_email} · Will permanently remove from squadron roster`,
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Cadet</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCadetModal(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors shadow-sm"
                    >
                      Save Cadet Records
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {changePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleChangePassword} className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-slate-900">Change Password</h3>
            </div>
            <p className="text-[11px] text-slate-500">Enter your current password to verify your account before choosing a new one.</p>
            <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password" autoComplete="current-password" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
            <input type="password" minLength={8} required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" autoComplete="new-password" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
            <input type="password" minLength={8} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="w-full px-3 py-2 border border-slate-300 rounded-xl" />
            {passwordMessage && <p className="text-xs text-slate-600">{passwordMessage}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setChangePasswordOpen(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordMessage(''); }} className="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold">Change Password</button>
            </div>
          </form>
        </div>
      )}

      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-heading text-base font-bold text-slate-900">
                Confirm Permanent Deletion
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove this record from squadron systems?
              </p>
              <p className="text-sm font-bold text-rose-700 bg-rose-50 px-3 py-2 rounded-xl border border-rose-100 mt-2 font-mono break-all">
                {deleteConfirmItem.title}
              </p>
              {deleteConfirmItem.subtitle && (
                <p className="text-[11px] text-slate-500 mt-1">{deleteConfirmItem.subtitle}</p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs animate-in slide-in-from-bottom-3">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{deleteToast}</span>
        </div>
      )}

      {aeModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Excused Absence (AE) Record
                  </h3>
                  <p className="text-xs text-slate-500">
                    {aeModalData.cadet.rank} {aeModalData.cadet.first_name} {aeModalData.cadet.last_name} · Date: {aeModalData.date}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAeModalData(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50 border border-sky-100">
                <span className="font-semibold text-sky-900">Attendance Status</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-600 text-white">
                  Absent Excused - AE (Approved)
                </span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Reason for Excused Absence / Officer Notes *
                </label>
                <textarea
                  rows={4}
                  value={aeModalData.reason}
                  onChange={e => setAeModalData({ ...aeModalData, reason: e.target.value })}
                  placeholder="Enter reason or officer note for this excused absence..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 font-sans"
                />
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-slate-500 font-medium">Quick suggestions / templates:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'School Examination / Academic Study',
                    'Medical Appointment / Illness',
                    'Family Bereavement / Commitment',
                    'Cadet Regional Marksmanship / Training',
                    'Authorized by Commanding Officer',
                  ].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAeModalData({ ...aeModalData, reason: preset })}
                      className="px-2.5 py-1 text-[10px] bg-slate-100 hover:bg-sky-50 hover:text-sky-700 rounded-lg border border-slate-200 transition-colors font-medium text-slate-600"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setAeModalData(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAeModal}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save AE Details</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {saveToast && (
        <div className="fixed top-5 right-5 z-50 bg-white border border-emerald-200 shadow-2xl rounded-2xl p-4 max-w-sm flex items-start gap-3 animate-in slide-in-from-top-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 pr-2">
            <p className="text-xs font-bold text-slate-900">{saveToast.title}</p>
            {saveToast.message && (
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{saveToast.message}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSaveToast(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
