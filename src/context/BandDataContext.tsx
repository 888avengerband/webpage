import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Profile,
  SheetMusic,
  SongPart,
  PartAssignment,
  AttendanceRecord,
  ExcusedAbsence,
  AttendanceStatus,
  CadetAssignedMusic,
  CalendarEvent,
} from '../types/database';
import { useAuth } from './AuthContext';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import {
  INITIAL_PROFILES,
  INITIAL_SHEET_MUSIC,
  INITIAL_SONG_PARTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_EXCUSED_ABSENCES,
  INITIAL_CALENDAR_EVENTS,
  loadFromStorage,
  saveToStorage,
  normalizeProfilesList,
} from '../lib/mockStore';

interface BandDataContextType {
  // Profiles / Roster
  profiles: Profile[];
  visibleProfiles: Profile[];
  addMember: (data: Omit<Profile, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  updateMember: (id: string, updates: Partial<Profile>) => Promise<boolean>;
  deleteMember: (id: string) => Promise<boolean>;

  // Calendar & Schedule
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'created_at'>) => Promise<boolean>;
  deleteCalendarEvent: (id: string) => Promise<boolean>;

  // Sheet Music & Parts
  sheetMusic: SheetMusic[];
  songParts: SongPart[];
  partAssignments: PartAssignment[];
  addSongWithPart: (
    title: string,
    composer: string,
    partName: string,
    fileUrl: string,
    assignedCadetIds?: string[]
  ) => Promise<boolean>;
  addSongPart: (
    songId: string,
    instrumentPart: string,
    fileUrl: string,
    assignedCadetIds?: string[]
  ) => Promise<boolean>;
  assignCadetsToPart: (songPartId: string, profileIds: string[]) => Promise<boolean>;
  deleteSong: (id: string) => Promise<boolean>;
  deleteSongPart: (id: string) => Promise<boolean>;
  myAssignedMusic: CadetAssignedMusic[];

  // Attendance
  attendanceRecords: AttendanceRecord[];
  visibleAttendance: AttendanceRecord[];
  markAttendance: (profileId: string, date: string, status: AttendanceStatus) => Promise<boolean>;
  markAllPresentForDate: (date: string) => Promise<boolean>;
  getCadetAttendanceStats: (profileId: string) => {
    total: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    rate: number;
  };
  getAttendanceForDate: (date: string) => Record<string, AttendanceStatus>;

  // Excused Absences
  excusedAbsences: ExcusedAbsence[];
  visibleExcusedAbsences: ExcusedAbsence[];
  submitExcusedAbsence: (dateOfAbsence: string, reason: string) => Promise<boolean>;
  reviewExcusedAbsence: (id: string, status: 'Approved' | 'Rejected') => Promise<boolean>;
  autoMarkAE: (absenceId: string) => Promise<boolean>;
  updateExcusedAbsence: (id: string, updates: Partial<ExcusedAbsence>) => Promise<boolean>;
  upsertExcusedAbsence: (profileId: string, date: string, reason: string) => Promise<boolean>;

  // State
  isLoading: boolean;
  activeRehearsalDate: string;
  setActiveRehearsalDate: (date: string) => void;
  rehearsalDates: string[];
}

const BandDataContext = createContext<BandDataContextType | undefined>(undefined);

export const BandDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, isAdmin, isLiveSupabase } = useAuth();

  // Storage-backed states
  const [profiles, setProfiles] = useState<Profile[]>(() =>
    normalizeProfilesList(loadFromStorage<Profile[]>('profiles', INITIAL_PROFILES))
  );

  const [sheetMusic, setSheetMusic] = useState<SheetMusic[]>(() =>
    loadFromStorage<SheetMusic[]>('sheet_music', INITIAL_SHEET_MUSIC)
  );

  const [songParts, setSongParts] = useState<SongPart[]>(() =>
    loadFromStorage<SongPart[]>('song_parts', INITIAL_SONG_PARTS)
  );

  const [partAssignments, setPartAssignments] = useState<PartAssignment[]>(() =>
    loadFromStorage<PartAssignment[]>('assignments', INITIAL_ASSIGNMENTS)
  );

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() =>
    loadFromStorage<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE)
  );

  const [excusedAbsences, setExcusedAbsences] = useState<ExcusedAbsence[]>(() =>
    loadFromStorage<ExcusedAbsence[]>('excused_absences', INITIAL_EXCUSED_ABSENCES)
  );

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() =>
    loadFromStorage<CalendarEvent[]>('calendar_events', INITIAL_CALENDAR_EVENTS)
  );

  const [activeRehearsalDate, setActiveRehearsalDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync Supabase profiles and calendar events into state on mount
  useEffect(() => {
    const syncSupabaseData = async () => {
      const supabase = getSupabaseClient();

      if (supabase && isSupabaseConfigured() && isLiveSupabase) {
        try {
          // Sync profiles
          const { data: profileData, error: profileError } =
            await supabase.from('profiles').select('*');

          if (profileError) {
            console.warn('Supabase profile fetch warning:', profileError);
          } else if (profileData && profileData.length > 0) {
            setProfiles(prev => {
              const merged = [...prev];

              profileData.forEach((supabaseProfile: Profile) => {
                const existingIdx = merged.findIndex(
                  p => p.id === supabaseProfile.id
                );

                if (existingIdx >= 0) {
                  merged[existingIdx] = supabaseProfile;
                } else {
                  merged.unshift(supabaseProfile);
                }
              });

              return normalizeProfilesList(merged);
            });
          }

          // Sync calendar events
          const { data: calendarData, error: calendarError } =
            await supabase
              .from('calendar_events')
              .select('*')
              .order('date', { ascending: true });

          if (calendarError) {
            console.warn(
              'Supabase calendar fetch warning:',
              calendarError
            );
          } else if (calendarData) {
            setCalendarEvents(calendarData as CalendarEvent[]);
          }
        } catch (err) {
          console.warn('Supabase data sync error:', err);
        }
      }
    };

    syncSupabaseData();
  }, [isLiveSupabase]);

  // Persist state updates to local store
  useEffect(() => { saveToStorage('profiles', profiles); }, [profiles]);
  useEffect(() => { saveToStorage('sheet_music', sheetMusic); }, [sheetMusic]);
  useEffect(() => { saveToStorage('song_parts', songParts); }, [songParts]);
  useEffect(() => { saveToStorage('assignments', partAssignments); }, [partAssignments]);
  useEffect(() => { saveToStorage('attendance', attendanceRecords); }, [attendanceRecords]);
  useEffect(() => { saveToStorage('excused_absences', excusedAbsences); }, [excusedAbsences]);
  useEffect(() => { saveToStorage('calendar_events', calendarEvents); }, [calendarEvents]);

  // Derived unique rehearsal dates from calendar and attendance records
  const rehearsalDates = useMemo(() => {
    const dates = new Set<string>();
    calendarEvents.forEach(evt => dates.add(evt.date));
    attendanceRecords.forEach(r => dates.add(r.date));
    return Array.from(dates).sort((a, b) => b.localeCompare(a));
  }, [attendanceRecords, calendarEvents]);

  // ============================================================================
  // STRICT RLS FILTERING (Enforcing database privacy boundaries)
  // ============================================================================

  // Profiles RLS: Admin sees all; Member sees ONLY their own profile!
  const visibleProfiles = useMemo(() => {
    if (!profile) return [];
    if (isAdmin) return profiles;
    return profiles.filter(p => p.id === profile.id);
  }, [profiles, profile, isAdmin]);

  // Attendance RLS: Admin sees all; Member sees ONLY their own attendance!
  const visibleAttendance = useMemo(() => {
    if (!profile) return [];
    if (isAdmin) return attendanceRecords;
    return attendanceRecords.filter(r => r.profile_id === profile.id);
  }, [attendanceRecords, profile, isAdmin]);

  // Excused Absences RLS: Admin sees all; Member sees ONLY their own requests!
  const visibleExcusedAbsences = useMemo(() => {
    if (!profile) return [];
    if (isAdmin) return excusedAbsences;
    return excusedAbsences.filter(ea => ea.profile_id === profile.id);
  }, [excusedAbsences, profile, isAdmin]);

  // Sheet Music Locker for current cadet/admin
  const myAssignedMusic = useMemo(() => {
    if (!profile) return [];

    // Find all song_part_ids assigned to current user
    const myPartIds = new Set(
      partAssignments
        .filter(pa => pa.profile_id === profile.id)
        .map(pa => pa.song_part_id)
    );

    const result: CadetAssignedMusic[] = [];
    partAssignments
      .filter(pa => pa.profile_id === profile.id)
      .forEach(pa => {
        const part = songParts.find(sp => sp.id === pa.song_part_id);
        if (!part) return;
        const song = sheetMusic.find(sm => sm.id === part.song_id);
        if (!song) return;

        result.push({
          assignmentId: pa.id,
          partId: part.id,
          songId: song.id,
          title: song.title,
          composer: song.composer,
          instrumentPart: part.instrument_part,
          fileUrl: part.file_url,
          assignedAt: pa.created_at,
        });
      });

    return result;
  }, [profile, partAssignments, songParts, sheetMusic]);

  // ============================================================================
  // ACTIONS & METHODS
  // ============================================================================

  // Add Member
  const addMember = async (
    data: Omit<Profile, 'id' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin role required to register members.' };
    }

    const newId = `u-${Date.now().toString(36)}`;
    const newProfile: Profile = {
      ...data,
      id: newId,
      created_at: new Date().toISOString(),
    };

    setProfiles(prev => [newProfile, ...prev]);

    // Live Supabase sync if enabled
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      try {
        await supabase.from('profiles').insert([newProfile]);
      } catch (err: any) {
        console.warn('Supabase profile sync warning:', err);
      }
    }

    return { success: true };
  };

  const updateMember = async (id: string, updates: Partial<Profile>): Promise<boolean> => {
    if (!isAdmin && profile?.id !== id) return false;

    setProfiles(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      try {
        await supabase.from('profiles').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase update warning:', err);
      }
    }
    return true;
  };

  const deleteMember = async (id: string): Promise<boolean> => {
    setProfiles(prev => {
      const next = prev.filter(p => p.id !== id);
      saveToStorage('profiles', next);
      return next;
    });
    setPartAssignments(prev => {
      const next = prev.filter(pa => pa.profile_id !== id);
      saveToStorage('assignments', next);
      return next;
    });
    setAttendanceRecords(prev => {
      const next = prev.filter(a => a.profile_id !== id);
      saveToStorage('attendance', next);
      return next;
    });
    setExcusedAbsences(prev => {
      const next = prev.filter(ea => ea.profile_id !== id);
      saveToStorage('excused_absences', next);
      return next;
    });

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      try {
        await supabase.from('profiles').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete warning:', err);
      }
    }
    return true;
  };

  // Add Song & Part
  const addSongWithPart = async (
    title: string,
    composer: string,
    partName: string,
    fileUrl: string,
    assignedCadetIds?: string[]
  ): Promise<boolean> => {
    if (!isAdmin) return false;

    const newSongId = `song-${Date.now().toString(36)}`;
    const newPartId = `part-${Date.now().toString(36)}`;

    const newSong: SheetMusic = {
      id: newSongId,
      title: title.trim(),
      composer: composer.trim() || 'Arranged for 888 Avenger Band',
      created_at: new Date().toISOString(),
    };

    const newPart: SongPart = {
      id: newPartId,
      song_id: newSongId,
      instrument_part: partName.trim(),
      file_url: fileUrl.trim(),
      created_at: new Date().toISOString(),
    };

    setSheetMusic(prev => [newSong, ...prev]);
    setSongParts(prev => [...prev, newPart]);

    if (assignedCadetIds && assignedCadetIds.length > 0) {
      const newAssignments: PartAssignment[] = assignedCadetIds.map(cadetId => ({
        id: `pa-${Date.now().toString(36)}-${cadetId.slice(-4)}`,
        song_part_id: newPartId,
        profile_id: cadetId,
        created_at: new Date().toISOString(),
      }));
      setPartAssignments(prev => [...prev, ...newAssignments]);
    }

    return true;
  };

  const addSongPart = async (
    songId: string,
    instrumentPart: string,
    fileUrl: string,
    assignedCadetIds?: string[]
  ): Promise<boolean> => {
    if (!isAdmin) return false;

    const newPartId = `part-${Date.now().toString(36)}`;
    const newPart: SongPart = {
      id: newPartId,
      song_id: songId,
      instrument_part: instrumentPart.trim(),
      file_url: fileUrl.trim(),
      created_at: new Date().toISOString(),
    };

    setSongParts(prev => [...prev, newPart]);

    if (assignedCadetIds && assignedCadetIds.length > 0) {
      const newAssignments: PartAssignment[] = assignedCadetIds.map(cadetId => ({
        id: `pa-${Date.now().toString(36)}-${cadetId.slice(-4)}`,
        song_part_id: newPartId,
        profile_id: cadetId,
        created_at: new Date().toISOString(),
      }));
      setPartAssignments(prev => [...prev, ...newAssignments]);
    }

    return true;
  };

  const assignCadetsToPart = async (songPartId: string, profileIds: string[]): Promise<boolean> => {
    if (!isAdmin) return false;

    // Filter out existing assignments for this part
    const otherAssignments = partAssignments.filter(pa => pa.song_part_id !== songPartId);
    const newAssignments: PartAssignment[] = profileIds.map(pId => ({
      id: `pa-${Date.now().toString(36)}-${pId.slice(-4)}`,
      song_part_id: songPartId,
      profile_id: pId,
      created_at: new Date().toISOString(),
    }));

    setPartAssignments([...otherAssignments, ...newAssignments]);
    return true;
  };

  const deleteSong = async (id: string): Promise<boolean> => {
    const partIds = songParts.filter(sp => sp.song_id === id).map(sp => sp.id);

    setSheetMusic(prev => {
      const next = prev.filter(sm => sm.id !== id);
      saveToStorage('sheet_music', next);
      return next;
    });
    setSongParts(prev => {
      const next = prev.filter(sp => sp.song_id !== id);
      saveToStorage('song_parts', next);
      return next;
    });
    setPartAssignments(prev => {
      const next = prev.filter(pa => !partIds.includes(pa.song_part_id));
      saveToStorage('assignments', next);
      return next;
    });
    return true;
  };

  const deleteSongPart = async (id: string): Promise<boolean> => {
    setSongParts(prev => {
      const next = prev.filter(sp => sp.id !== id);
      saveToStorage('song_parts', next);
      return next;
    });
    setPartAssignments(prev => {
      const next = prev.filter(pa => pa.song_part_id !== id);
      saveToStorage('assignments', next);
      return next;
    });
    return true;
  };

  // Calendar Event Operations
  const addCalendarEvent = async (
    eventData: Omit<CalendarEvent, 'id' | 'created_at'>
  ): Promise<boolean> => {
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([eventData])
        .select()
        .single();

      if (error || !data) {
        console.error('Failed to save calendar event:', error);
        return false;
      }

      setCalendarEvents(prev =>
        [data as CalendarEvent, ...prev].sort((a, b) =>
          a.date.localeCompare(b.date)
        )
      );

      return true;
    }

    const newEvt: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };

    setCalendarEvents(prev => {
      const next = [newEvt, ...prev].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      saveToStorage('calendar_events', next);
      return next;
    });

    return true;
  };

  const deleteCalendarEvent = async (id: string): Promise<boolean> => {
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Failed to delete calendar event:', error);
        return false;
      }
    }

    setCalendarEvents(prev => {
      const next = prev.filter(e => e.id !== id);
      saveToStorage('calendar_events', next);
      return next;
    });

    return true;
  };
  // Attendance Operations
  const markAttendance = async (
    profileId: string,
    date: string,
    status: AttendanceStatus
  ): Promise<boolean> => {
    if (!isAdmin) return false;

    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(
        r => r.profile_id === profileId && r.date === date
      );

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          status,
          marked_by: profile?.id || null,
        };
        return copy;
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now().toString(36)}-${profileId.slice(-3)}`,
          profile_id: profileId,
          date,
          status,
          marked_by: profile?.id || null,
          created_at: new Date().toISOString(),
        };
        return [newRecord, ...prev];
      }
    });

    return true;
  };

  const markAllPresentForDate = async (date: string): Promise<boolean> => {
    if (!isAdmin) return false;

    setAttendanceRecords(prev => {
      // Include both admins and members in roll call
      const allPersonnel = profiles.filter(p => p.role === 'admin' || p.role === 'member');
      const updated = [...prev];

      allPersonnel.forEach(person => {
        const idx = updated.findIndex(r => r.profile_id === person.id && r.date === date);
        if (idx >= 0) {
          // If already marked as AE, keep it; otherwise mark Present
          if (updated[idx].status !== 'Absent Excused - AE') {
            updated[idx] = {
              ...updated[idx],
              status: 'Present',
              marked_by: profile?.id || null,
            };
          }
        } else {
          updated.push({
            id: `att-${Date.now().toString(36)}-${person.id.slice(-3)}`,
            profile_id: person.id,
            date,
            status: 'Present',
            marked_by: profile?.id || null,
            created_at: new Date().toISOString(),
          });
        }
      });

      return updated;
    });

    return true;
  };

  const getAttendanceForDate = (date: string): Record<string, AttendanceStatus> => {
    const map: Record<string, AttendanceStatus> = {};
    attendanceRecords
      .filter(r => r.date === date)
      .forEach(r => {
        map[r.profile_id] = r.status;
      });
    return map;
  };

  const getCadetAttendanceStats = (profileId: string) => {
    const userRecords = attendanceRecords.filter(r => r.profile_id === profileId);
    const total = userRecords.length;
    const present = userRecords.filter(r => r.status === 'Present').length;
    const late = userRecords.filter(r => r.status === 'Late').length;
    const absent = userRecords.filter(r => r.status === 'Absent').length;
    const excused = userRecords.filter(r => r.status === 'Absent Excused - AE').length;

    // Standard Canadian cadet formula: (Present + Late + Excused) / Total
    const effective = present + late + excused;
    const rate = total > 0 ? Math.round((effective / total) * 100) : 100;

    return { total, present, late, absent, excused, rate };
  };

  // Excused Absences Operations
  const submitExcusedAbsence = async (dateOfAbsence: string, reason: string): Promise<boolean> => {
    if (!profile) return false;

    const newRequest: ExcusedAbsence = {
      id: `ea-${Date.now().toString(36)}`,
      profile_id: profile.id,
      date_of_absence: dateOfAbsence,
      reason: reason.trim(),
      status: 'Pending',
      created_at: new Date().toISOString(),
    };

    setExcusedAbsences(prev => [newRequest, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      try {
        await supabase.from('excused_absences').insert([newRequest]);
      } catch (err) {
        console.warn('Supabase excused absence insert warning:', err);
      }
    }

    return true;
  };

  const reviewExcusedAbsence = async (
    id: string,
    status: 'Approved' | 'Rejected'
  ): Promise<boolean> => {
    if (!isAdmin) return false;

    setExcusedAbsences(prev =>
      prev.map(ea => (ea.id === id ? { ...ea, status } : ea))
    );
    return true;
  };

  // Auto-Mark AE: Specifically required in user prompt!
  // Updates attendance record to AE for that date AND marks request as Approved
  const autoMarkAE = async (absenceId: string): Promise<boolean> => {
    if (!isAdmin) return false;

    const targetRequest = excusedAbsences.find(ea => ea.id === absenceId);
    if (!targetRequest) return false;

    // 1. Mark request as Approved
    setExcusedAbsences(prev =>
      prev.map(ea => (ea.id === absenceId ? { ...ea, status: 'Approved' } : ea))
    );

    // 2. Mark attendance to 'Absent Excused - AE' for that cadet and date
    await markAttendance(
      targetRequest.profile_id,
      targetRequest.date_of_absence,
      'Absent Excused - AE'
    );

    return true;
  };

  const updateExcusedAbsence = async (
    id: string,
    updates: Partial<ExcusedAbsence>
  ): Promise<boolean> => {
    if (!isAdmin) return false;
    setExcusedAbsences(prev =>
      prev.map(ea => (ea.id === id ? { ...ea, ...updates } : ea))
    );
    return true;
  };

  const upsertExcusedAbsence = async (
    profileId: string,
    date: string,
    reason: string
  ): Promise<boolean> => {
    if (!isAdmin) return false;
    setExcusedAbsences(prev => {
      const existing = prev.find(
        ea => ea.profile_id === profileId && ea.date_of_absence === date
      );
      if (existing) {
        return prev.map(ea =>
          ea.id === existing.id ? { ...ea, reason, status: 'Approved' } : ea
        );
      }
      const newRec: ExcusedAbsence = {
        id: `ea-${Date.now()}`,
        profile_id: profileId,
        date_of_absence: date,
        reason,
        status: 'Approved',
        created_at: new Date().toISOString(),
      };
      return [newRec, ...prev];
    });
    return true;
  };

  return (
    <BandDataContext.Provider
      value={{
        profiles,
        visibleProfiles,
        addMember,
        updateMember,
        deleteMember,
        sheetMusic,
        songParts,
        partAssignments,
        addSongWithPart,
        addSongPart,
        assignCadetsToPart,
        deleteSong,
        deleteSongPart,
        myAssignedMusic,
        attendanceRecords,
        visibleAttendance,
        markAttendance,
        markAllPresentForDate,
        getCadetAttendanceStats,
        getAttendanceForDate,
        excusedAbsences,
        visibleExcusedAbsences,
        submitExcusedAbsence,
        reviewExcusedAbsence,
        autoMarkAE,
        updateExcusedAbsence,
        upsertExcusedAbsence,
        isLoading,
        activeRehearsalDate,
        setActiveRehearsalDate,
        rehearsalDates,
        calendarEvents,
        addCalendarEvent,
        deleteCalendarEvent,
      }}
    >
      {children}
    </BandDataContext.Provider>
  );
};

export const useBandData = () => {
  const context = useContext(BandDataContext);
  if (!context) {
    throw new Error('useBandData must be used within a BandDataProvider');
  }
  return context;
};
