import {
  Profile,
  SheetMusic,
  SongPart,
  PartAssignment,
  AttendanceRecord,
  ExcusedAbsence,
  CalendarEvent,
} from '../types/database';

// Keep locally-created records separate from prior seeded data.
const LOCAL_STORAGE_KEY_PREFIX = '888_avenger_store_v2_';

// The application intentionally starts with no roster, music, attendance, absence,
// or calendar data. Populate these records through Supabase or the portal UI.
export const INITIAL_PROFILES: Profile[] = [];
export const INITIAL_SHEET_MUSIC: SheetMusic[] = [];
export const INITIAL_SONG_PARTS: SongPart[] = [];
export const INITIAL_ASSIGNMENTS: PartAssignment[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_EXCUSED_ABSENCES: ExcusedAbsence[] = [];
export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [];

export const loadFromStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage`, error);
    return fallback;
  }
};

export const normalizeProfile = (profile: Profile): Profile => profile;

export const normalizeProfilesList = (profiles: Profile[]): Profile[] =>
  profiles.map(normalizeProfile);

export const saveToStorage = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage`, error);
  }
};
