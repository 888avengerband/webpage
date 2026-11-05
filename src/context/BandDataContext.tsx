import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
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

const getVancouverDateString = (date = new Date()): string => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Vancouver', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const part = (type: string) => parts.find(item => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
};

interface BandDataContextType {
  // Profiles / Roster
  profiles: Profile[];
  visibleProfiles: Profile[];
  addMember: (data: Omit<Profile, 'id' | 'created_at'> & { temporary_password?: string }) => Promise<{ success: boolean; error?: string }>;
  updateMember: (id: string, updates: Partial<Profile>) => Promise<boolean>;
  deleteMember: (id: string) => Promise<boolean>;
  resetMemberPassword: (id: string, password: string) => Promise<{ success: boolean; error?: string }>;

  // Calendar & Schedule
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'created_at'>) => Promise<boolean>;
  updateCalendarEvent: (id: string, updates: Partial<Omit<CalendarEvent, 'id' | 'created_at'>>) => Promise<boolean>;
  deleteCalendarEvent: (id: string) => Promise<boolean>;

  // Sheet Music & Parts
  sheetMusic: SheetMusic[];
  songParts: SongPart[];
  partAssignments: PartAssignment[];
  addSongWithPart: (
    title: string,
    composer: string,
    instrument: string,
    partName: string,
    fileUrl: string,
    assignedCadetIds?: string[]
  ) => Promise<boolean>;
  addSongPart: (
    songId: string,
    instrument: string,
    partName: string,
    fileUrl: string,
    assignedCadetIds?: string[]
  ) => Promise<boolean>;
  updateSheetMusic: (id: string, updates: Partial<Pick<SheetMusic, 'title' | 'composer'>>) => Promise<boolean>;
  assignCadetsToPart: (songPartId: string, profileIds: string[]) => Promise<boolean>;
  updateSongPart: (id: string, updates: Partial<Pick<SongPart, 'instrument_part' | 'part_name' | 'file_url'>>) => Promise<boolean>;
  deleteSong: (id: string) => Promise<boolean>;
  deleteSongPart: (id: string) => Promise<boolean>;
  myAssignedMusic: CadetAssignedMusic[];

  // Attendance
  attendanceRecords: AttendanceRecord[];
  visibleAttendance: AttendanceRecord[];
  markAttendance: (profileId: string, date: string, status: AttendanceStatus) => Promise<boolean>;
  markAllPresentForDate: (date: string) => Promise<boolean>;
  clearAttendanceForDate: (date: string) => Promise<boolean>;
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
  isLiveSupabase: boolean;
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
    getVancouverDateString()
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const musicMigrationAttempted = useRef(false);

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
          } else if (profileData) {
            // In live Supabase mode, Supabase is the authoritative roster.
            // Do not merge old local/mock profiles into the live roster.
            // This prevents stale generated IDs such as "u-..." from
            // appearing beside the real UUID-backed Supabase profile.
            setProfiles(normalizeProfilesList(profileData as Profile[]));
          }

          // Sync attendance records
          const { data: attendanceData, error: attendanceError } =
            await supabase
              .from('attendance')
              .select('*')
              .order('date', { ascending: false });

          if (attendanceError) {
            console.warn('Supabase attendance fetch warning:', attendanceError);
          } else if (attendanceData) {
            setAttendanceRecords(attendanceData as AttendanceRecord[]);
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

          // Load the shared music catalogue and assignments from Supabase.
          const [musicResult, partsResult, assignmentsResult] = await Promise.all([
            supabase.from('sheet_music').select('*').order('title', { ascending: true }),
            supabase.from('song_parts').select('*'),
            supabase.from('part_assignments').select('*'),
          ]);

          if (musicResult.error) {
            console.warn('Supabase sheet music fetch warning:', musicResult.error);
          } else if (isAdmin && !musicMigrationAttempted.current && sheetMusic.length > 0 && songParts.length > 0 && (musicResult.data?.length === 0 || partsResult.data?.length === 0)) {
            // One-time import of the legacy browser catalogue on the first admin login.
            // Existing data URLs are copied into Storage before the shared rows are created.
            musicMigrationAttempted.current = true;
            try {
              // Reuse songs already in Supabase so a previous partial migration
              // never creates duplicate catalogue entries.
              const existingSongs = (musicResult.data || []) as SheetMusic[];
              const normalizeSongKey = (value: string) => value.trim().toLowerCase().replace(/\\s+/g, ' ');
              const songIdMap = new Map<string, string>();
              const songsToInsert: SheetMusic[] = [];
              for (const localSong of sheetMusic) {
                const matchingSong = existingSongs.find(remoteSong =>
                  normalizeSongKey(remoteSong.title) === normalizeSongKey(localSong.title) &&
                  normalizeSongKey(remoteSong.composer || '') === normalizeSongKey(localSong.composer || '')
                ) || existingSongs.find(remoteSong =>
                  normalizeSongKey(remoteSong.title) === normalizeSongKey(localSong.title)
                );
                if (matchingSong) songIdMap.set(localSong.id, matchingSong.id);
                else songsToInsert.push(localSong);
              }

              const { data: importedSongs, error: importSongsError } = songsToInsert.length
                ? await supabase.from('sheet_music')
                    .insert(songsToInsert.map(song => ({ title: song.title, composer: song.composer })))
                    .select()
                : { data: [], error: null };
              if (importSongsError || !importedSongs) throw importSongsError || new Error('Could not import existing pieces.');

              songsToInsert.forEach((song, index) => {
                if (importedSongs[index]) songIdMap.set(song.id, importedSongs[index].id);
              });
              const allSharedSongs = [...existingSongs, ...((importedSongs || []) as SheetMusic[])];

              const partRows = [];
              for (const oldPart of songParts) {
                const newSongId = songIdMap.get(oldPart.song_id);
                if (!newSongId) continue;
                let sharedFileUrl = oldPart.file_url;
                if (sharedFileUrl.startsWith('data:')) {
                  const response = await fetch(sharedFileUrl);
                  let blob = await response.blob();
                  if (blob.type === 'text/html') {
                    const documentText = await blob.text();
                    const parsed = new DOMParser().parseFromString(documentText, 'text/html');
                    const embeddedUrls = new Map<string, string>();
                    const embeddedElements = Array.from(parsed.querySelectorAll('img[src^="data:"], iframe[src^="data:"], a[href^="data:"]'));
                    for (const element of embeddedElements) {
                      const attribute = element.tagName.toLowerCase() === 'a' ? 'href' : 'src';
                      const embeddedUrl = element.getAttribute(attribute);
                      if (!embeddedUrl) continue;
                      let publicUrl = embeddedUrls.get(embeddedUrl);
                      if (!publicUrl) {
                        const embeddedBlob = await (await fetch(embeddedUrl)).blob();
                        const embeddedExtension = embeddedBlob.type === 'application/pdf' ? 'pdf'
                          : embeddedBlob.type === 'image/png' ? 'png'
                          : embeddedBlob.type === 'image/webp' ? 'webp' : 'jpg';
                        const embeddedPath = `legacy/assets/${Date.now()}-${Math.random().toString(36).slice(2)}.${embeddedExtension}`;
                        const { error: embeddedUploadError } = await supabase.storage.from('sheet-music').upload(embeddedPath, embeddedBlob, {
                          contentType: embeddedBlob.type || 'application/octet-stream', cacheControl: '31536000', upsert: false,
                        });
                        if (embeddedUploadError) throw embeddedUploadError;
                        publicUrl = supabase.storage.from('sheet-music').getPublicUrl(embeddedPath).data.publicUrl;
                        embeddedUrls.set(embeddedUrl, publicUrl);
                      }
                      element.setAttribute(attribute, publicUrl);
                      if (element.tagName.toLowerCase() === 'img') {
                        element.setAttribute('loading', 'lazy');
                        element.setAttribute('decoding', 'async');
                      }
                      if (element.tagName.toLowerCase() === 'iframe') element.setAttribute('loading', 'lazy');
                    }
                    parsed.title = 'Sheet Music';
                    const style = parsed.createElement('style');
                    style.textContent = `*{box-sizing:border-box}body{margin:0;background:#eef2f7;color:#17243b;font-family:Inter,ui-sans-serif,system-ui,sans-serif}header{background:linear-gradient(120deg,#101d35,#173e67)!important;color:#fff;padding:28px max(20px,calc((100% - 1040px)/2)) 24px}header h1{font-size:clamp(23px,4vw,34px);font-weight:800;letter-spacing:-.03em;margin:8px 0 6px}header p{color:#d0deed}section{max-width:1000px;margin:18px auto!important;padding:clamp(12px,2vw,22px)!important;border:1px solid #dce4ed;border-radius:16px!important;box-shadow:0 5px 20px #18324d0b!important}section img{display:block;width:100%;height:auto;max-height:calc(100vh - 150px);object-fit:contain}section iframe{width:100%;height:min(88vh,1100px);border:0;border-radius:8px}.page-label{font-size:10px!important;letter-spacing:.15em;font-weight:800;color:#6b829b!important}@media(max-width:600px){header{padding:22px 18px}section{margin:12px!important;border-radius:12px!important}section iframe{height:78vh}}`;
                    parsed.head.appendChild(style);
                    blob = new Blob(['<!doctype html>' + parsed.documentElement.outerHTML], { type: 'text/html' });
                  }
                  const extension = blob.type === 'application/pdf' ? 'pdf'
                    : blob.type === 'text/html' ? 'html'
                    : blob.type === 'image/png' ? 'png'
                    : blob.type === 'image/webp' ? 'webp' : 'jpg';
                  const path = `legacy/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
                  const { error: uploadError } = await supabase.storage.from('sheet-music').upload(path, blob, {
                    contentType: blob.type || 'application/octet-stream', cacheControl: '31536000', upsert: false,
                  });
                  if (uploadError) throw uploadError;
                  sharedFileUrl = supabase.storage.from('sheet-music').getPublicUrl(path).data.publicUrl;
                }
                partRows.push({
                  oldId: oldPart.id,
                  row: { song_id: newSongId, instrument_part: oldPart.instrument_part, part_name: oldPart.part_name || 'Main Part', file_url: sharedFileUrl },
                });
              }

              const { data: importedParts, error: importPartsError } = partRows.length
                ? await supabase.from('song_parts').insert(partRows.map(item => item.row)).select()
                : { data: [], error: null };
              if (importPartsError || !importedParts) throw importPartsError || new Error('Could not import existing parts.');

              const partIdMap = new Map<string, string>();
              partRows.forEach((item, index) => {
                if (importedParts[index]) partIdMap.set(item.oldId, importedParts[index].id);
              });
              const validProfileIds = new Set((profileData || []).map(person => person.id));
              const assignmentRows = partAssignments
                .filter(item => partIdMap.has(item.song_part_id) && validProfileIds.has(item.profile_id))
                .map(item => ({ song_part_id: partIdMap.get(item.song_part_id)!, profile_id: item.profile_id }));
              const { data: importedAssignments, error: importAssignmentsError } = assignmentRows.length
                ? await supabase.from('part_assignments')
                    .upsert(assignmentRows, { onConflict: 'song_part_id,profile_id', ignoreDuplicates: true })
                    .select()
                : { data: [], error: null };
              if (importAssignmentsError) {
                console.warn('Music parts were migrated, but some cadet assignments need review:', importAssignmentsError);
              }

              setSheetMusic(allSharedSongs);
              setSongParts((importedParts || []) as SongPart[]);
              setPartAssignments((importedAssignments || []) as PartAssignment[]);
              console.info('Legacy sheet music catalogue successfully migrated to Supabase.');
            } catch (migrationError) {
              musicMigrationAttempted.current = false;
              console.error('Legacy music migration did not finish. Your browser copy has been preserved:', migrationError);
            }
          } else if (musicResult.data) {
            setSheetMusic(musicResult.data as SheetMusic[]);
            if (partsResult.data) setSongParts(partsResult.data as SongPart[]);
            if (assignmentsResult.data) setPartAssignments(assignmentsResult.data as PartAssignment[]);
          }

          if (musicResult.data?.length === 0 && (!isAdmin || musicMigrationAttempted.current)) {
            if (musicMigrationAttempted.current && sheetMusic.length > 0) {
              // Keep the local copy visible if a migration failed partway through.
            } else {
              setSheetMusic([]);
              if (partsResult.data) setSongParts(partsResult.data as SongPart[]);
              if (assignmentsResult.data) setPartAssignments(assignmentsResult.data as PartAssignment[]);
            }
          }
        } catch (err) {
          console.warn('Supabase data sync error:', err);
        }
      }
    };

    syncSupabaseData();
  }, [isLiveSupabase, isAdmin, profile?.id]);

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
          partName: part.part_name || 'Main Part',
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
    data: Omit<Profile, 'id' | 'created_at'> & { temporary_password?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin role required to register members.' };
    }

    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          return { success: false, error: 'Your Supabase session has expired. Please sign in again.' };
        }

        const response = await fetch('/api/admin/create-member', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify(data),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.profile) {
          return {
            success: false,
            error: result.error || 'The Supabase Auth account/profile could not be created.',
          };
        }

        const newProfile = result.profile as Profile;
        setProfiles(prev => [newProfile, ...prev.filter(p => p.id !== newProfile.id)]);

        return { success: true };
      } catch (err: any) {
        return {
          success: false,
          error: err?.message || 'Failed to create the Supabase Auth account.',
        };
      }
    }

    const newId = `u-${Date.now().toString(36)}`;
    const newProfile: Profile = {
      ...data,
      id: newId,
      created_at: new Date().toISOString(),
    };

    setProfiles(prev => [newProfile, ...prev]);
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

  const resetMemberPassword = async (id: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) return { success: false, error: 'Unauthorized: Admin role required.' };
    if (password.length < 8) return { success: false, error: 'Password must be at least 8 characters.' };
    const supabase = getSupabaseClient();
    if (!supabase || !isSupabaseConfigured() || !isLiveSupabase) return { success: false, error: 'Supabase is not connected.' };
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) return { success: false, error: 'Your Supabase session has expired. Please sign in again.' };
      const response = await fetch('/api/admin/reset-member-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionData.session.access_token}` },
        body: JSON.stringify({ user_id: id, new_password: password }),
      });
      const result = await response.json().catch(() => ({}));
      return response.ok ? { success: true } : { success: false, error: result.error || 'Password reset failed.' };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Password reset failed.' };
    }
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
    instrument: string,
    partName: string,
    fileUrl: string,
    assignedCadetIds?: string[]
  ): Promise<boolean> => {
    if (!isAdmin) return false;
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      const { data: song, error: songError } = await supabase
        .from('sheet_music')
        .insert([{ title: title.trim(), composer: composer.trim() || 'Arranged for 888 Avenger Band' }])
        .select()
        .single();
      if (songError || !song) {
        console.error('Failed to create sheet music piece:', songError);
        return false;
      }

      const { data: part, error: partError } = await supabase
        .from('song_parts')
        .insert([{ song_id: song.id, instrument_part: instrument.trim(), part_name: partName.trim(), file_url: fileUrl.trim() }])
        .select()
        .single();
      if (partError || !part) {
        console.error('Failed to create sheet music part:', partError);
        await supabase.from('sheet_music').delete().eq('id', song.id);
        return false;
      }

      if (assignedCadetIds?.length) {
        const rows = assignedCadetIds.map(profile_id => ({ song_part_id: part.id, profile_id }));
        const { data: insertedAssignments, error } = await supabase.from('part_assignments').insert(rows).select();
        if (error) {
          console.error('Failed to assign musicians to new part:', error);
          await supabase.from('sheet_music').delete().eq('id', song.id);
          return false;
        }
        setPartAssignments(prev => [...prev, ...((insertedAssignments || []) as PartAssignment[])]);
      }
      setSheetMusic(prev => [song as SheetMusic, ...prev]);
      setSongParts(prev => [...prev, part as SongPart]);
      return true;
    }

    const newSongId = `song-${Date.now().toString(36)}`;
    const newPartId = `part-${Date.now().toString(36)}`;
    const newSong: SheetMusic = { id: newSongId, title: title.trim(), composer: composer.trim() || 'Arranged for 888 Avenger Band', created_at: new Date().toISOString() };
    const newPart: SongPart = { id: newPartId, song_id: newSongId, instrument_part: instrument.trim(), part_name: partName.trim(), file_url: fileUrl.trim(), created_at: new Date().toISOString() };
    setSheetMusic(prev => [newSong, ...prev]);
    setSongParts(prev => [...prev, newPart]);
    if (assignedCadetIds?.length) {
      const newAssignments: PartAssignment[] = assignedCadetIds.map(cadetId => ({
        id: `pa-${Date.now().toString(36)}-${cadetId.slice(-4)}`, song_part_id: newPartId, profile_id: cadetId, created_at: new Date().toISOString(),
      }));
      setPartAssignments(prev => [...prev, ...newAssignments]);
    }
    return true;
  };

  const addSongPart = async (
    songId: string,
    instrument: string,
    partName: string,
    fileUrl: string,
    assignedCadetIds?: string[]
  ): Promise<boolean> => {
    if (!isAdmin) return false;
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      const { data: part, error } = await supabase.from('song_parts')
        .insert([{ song_id: songId, instrument_part: instrument.trim(), part_name: partName.trim(), file_url: fileUrl.trim() }])
        .select().single();
      if (error || !part) {
        console.error('Failed to create sheet music part:', error);
        return false;
      }
      if (assignedCadetIds?.length) {
        const { error: assignmentError } = await supabase.from('part_assignments')
          .insert(assignedCadetIds.map(profile_id => ({ song_part_id: part.id, profile_id })));
        if (assignmentError) {
          console.error('Failed to assign musicians:', assignmentError);
          await supabase.from('song_parts').delete().eq('id', part.id);
          return false;
        }
      }
      setSongParts(prev => [...prev, part as SongPart]);
      if (assignedCadetIds?.length) {
        const { data } = await supabase.from('part_assignments').select('*').eq('song_part_id', part.id);
        if (data) setPartAssignments(prev => [...prev, ...(data as PartAssignment[])]);
      }
      return true;
    }
    const newPartId = `part-${Date.now().toString(36)}`;
    const newPart: SongPart = { id: newPartId, song_id: songId, instrument_part: instrument.trim(), part_name: partName.trim(), file_url: fileUrl.trim(), created_at: new Date().toISOString() };
    setSongParts(prev => [...prev, newPart]);
    if (assignedCadetIds?.length) {
      const newAssignments: PartAssignment[] = assignedCadetIds.map(cadetId => ({
        id: `pa-${Date.now().toString(36)}-${cadetId.slice(-4)}`, song_part_id: newPartId, profile_id: cadetId, created_at: new Date().toISOString(),
      }));
      setPartAssignments(prev => [...prev, ...newAssignments]);
    }
    return true;
  };

  const updateSheetMusic = async (id: string, updates: Partial<Pick<SheetMusic, 'title' | 'composer'>>): Promise<boolean> => {
    if (!isAdmin) return false;
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      const { data, error } = await supabase.from('sheet_music').update(updates).eq('id', id).select().single();
      if (error || !data) { console.error('Failed to update piece details:', error); return false; }
      setSheetMusic(prev => prev.map(song => song.id === id ? data as SheetMusic : song));
      return true;
    }
    setSheetMusic(prev => {
      const next = prev.map(song => song.id === id ? { ...song, ...updates } : song);
      saveToStorage('sheet_music', next);
      return next;
    });
    return true;
  };

  const updateSongPart = async (id: string, updates: Partial<Pick<SongPart, 'instrument_part' | 'part_name' | 'file_url'>>): Promise<boolean> => {
    if (!isAdmin) return false;
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      const { data, error } = await supabase.from('song_parts').update(updates).eq('id', id).select().single();
      if (error || !data) { console.error('Failed to update song part:', error); return false; }
      setSongParts(prev => prev.map(part => part.id === id ? data as SongPart : part));
      return true;
    }
    setSongParts(prev => {
      const next = prev.map(part => part.id === id ? { ...part, ...updates } : part);
      saveToStorage('song_parts', next);
      return next;
    });
    return true;
  };

  const assignCadetsToPart = async (songPartId: string, profileIds: string[]): Promise<boolean> => {
    if (!isAdmin) return false;

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      const { error: deleteError } = await supabase.from('part_assignments').delete().eq('song_part_id', songPartId);
      if (deleteError) { console.error('Failed to replace part assignments:', deleteError); return false; }
      if (profileIds.length) {
        const { error } = await supabase.from('part_assignments').insert(profileIds.map(profile_id => ({ song_part_id: songPartId, profile_id })));
        if (error) { console.error('Failed to save part assignments:', error); return false; }
      }
      const { data } = await supabase.from('part_assignments').select('*').eq('song_part_id', songPartId);
      setPartAssignments(prev => [...prev.filter(pa => pa.song_part_id !== songPartId), ...((data || []) as PartAssignment[])]);
      return true;
    }
    const otherAssignments = partAssignments.filter(pa => pa.song_part_id !== songPartId);
    const newAssignments: PartAssignment[] = profileIds.map(pId => ({
      id: `pa-${Date.now().toString(36)}-${pId.slice(-4)}`, song_part_id: songPartId, profile_id: pId, created_at: new Date().toISOString(),
    }));
    setPartAssignments([...otherAssignments, ...newAssignments]);
    return true;
  };

  const deleteSong = async (id: string): Promise<boolean> => {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      const { error } = await supabase.from('sheet_music').delete().eq('id', id);
      if (error) { console.error('Failed to delete sheet music piece:', error); return false; }
    }
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
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      const { error } = await supabase.from('song_parts').delete().eq('id', id);
      if (error) { console.error('Failed to delete sheet music part:', error); return false; }
    }
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
        [data as CalendarEvent, ...prev].sort((a, b) => a.date.localeCompare(b.date))
      );
      return true;
    }

    const newEvt: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };

    setCalendarEvents(prev => [newEvt, ...prev].sort((a, b) => a.date.localeCompare(b.date)));
    return true;
  };

  const updateCalendarEvent = async (
    id: string,
    updates: Partial<Omit<CalendarEvent, 'id' | 'created_at'>>
  ): Promise<boolean> => {
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        console.error('Failed to update calendar event:', error);
        return false;
      }

      setCalendarEvents(prev =>
        prev
          .map(event => event.id === id ? (data as CalendarEvent) : event)
          .sort((a, b) => a.date.localeCompare(b.date))
      );
      return true;
    }

    setCalendarEvents(prev => {
      const next = prev
        .map(event => event.id === id ? { ...event, ...updates } : event)
        .sort((a, b) => a.date.localeCompare(b.date));
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

    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      // Avoid relying on a database-specific unique constraint for upsert.
      const { data: existing, error: findError } = await supabase
        .from('attendance')
        .select('*')
        .eq('profile_id', profileId)
        .eq('date', date)
        .maybeSingle();

      if (findError) {
        console.error('Failed to find attendance record:', findError);
        return false;
      }

      let data: AttendanceRecord | null = null;

      if (existing) {
        const { data: updated, error } = await supabase
          .from('attendance')
          .update({
            status,
            marked_by: profile?.id || null,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error || !updated) {
          console.error('Failed to update attendance:', error);
          return false;
        }
        data = updated as AttendanceRecord;
      } else {
        const { data: inserted, error } = await supabase
          .from('attendance')
          .insert([{
            profile_id: profileId,
            date,
            status,
            marked_by: profile?.id || null,
          }])
          .select()
          .single();

        if (error || !inserted) {
          console.error('Failed to insert attendance:', error);
          return false;
        }
        data = inserted as AttendanceRecord;
      }

      setAttendanceRecords(prev => {
        const index = prev.findIndex(
          r => r.profile_id === profileId && r.date === date
        );
        if (index >= 0) {
          const copy = [...prev];
          copy[index] = data!;
          return copy;
        }
        return [data!, ...prev];
      });

      return true;
    }

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
      }

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now().toString(36)}-${profileId.slice(-3)}`,
        profile_id: profileId,
        date,
        status,
        marked_by: profile?.id || null,
        created_at: new Date().toISOString(),
      };

      return [newRecord, ...prev];
    });

    return true;
  };

  const markAllPresentForDate = async (date: string): Promise<boolean> => {
    if (!isAdmin) return false;

    const allPersonnel = profiles.filter(
      p => p.role === 'admin' || p.role === 'member'
    );

    for (const person of allPersonnel) {
      const existing = attendanceRecords.find(
        r => r.profile_id === person.id && r.date === date
      );

      if (existing?.status === 'Absent Excused - AE') {
        continue;
      }

      const success = await markAttendance(person.id, date, 'Present');

      if (!success) {
        return false;
      }
    }

    return true;
  };

  const clearAttendanceForDate = async (date: string): Promise<boolean> => {
    if (!isAdmin) return false;

    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured() && isLiveSupabase) {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('date', date)
        .in('status', ['Present', 'Late', 'Absent']);

      if (error) {
        console.error('Failed to clear attendance:', error);
        return false;
      }
    }

    setAttendanceRecords(prev =>
      prev.filter(
        r => r.date !== date || r.status === 'Absent Excused - AE'
      )
    );

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
        resetMemberPassword,
        sheetMusic,
        songParts,
        partAssignments,
        addSongWithPart,
        addSongPart,
        updateSheetMusic,
        assignCadetsToPart,
        updateSongPart,
        deleteSong,
        deleteSongPart,
        myAssignedMusic,
        attendanceRecords,
        visibleAttendance,
        markAttendance,
        markAllPresentForDate,
        clearAttendanceForDate,
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
        isLiveSupabase,
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
