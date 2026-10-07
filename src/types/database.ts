export type UserRole = 'admin' | 'member';

export type CadetRank =
  | 'Cdt'
  | 'LAC'
  | 'Cpl'
  | 'FCpl'
  | 'Sgt'
  | 'FSgt'
  | 'WO2'
  | 'WO1'
  | 'CV'
  | 'CI'
  | 'OCdt'
  | '2Lt'
  | 'Lt'
  | 'Capt'
  | 'Maj'

export const OFFICER_RANKS: CadetRank[] = ['CV', 'CI', 'OCdt', '2Lt', 'Lt', 'Capt', 'Maj'];

export const isOfficerRank = (rank: string): boolean => {
  return OFFICER_RANKS.includes(rank as CadetRank);
};

export type AttendanceStatus =
  | 'Present'
  | 'Late'
  | 'Absent'
  | 'Absent Excused - AE';

export type ExcusedAbsenceStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  rank: CadetRank;
  cadet365_email: string;
  instrument: string;
  role: UserRole;
  phone: string | null;
  created_at: string;
}

export interface SheetMusic {
  id: string;
  title: string;
  composer: string;
  created_at: string;
  parts_count?: number;
}

export interface SongPart {
  id: string;
  song_id: string;
  instrument_part: string;
  file_url: string;
  created_at: string;
  song?: SheetMusic;
}

export interface PartAssignment {
  id: string;
  song_part_id: string;
  profile_id: string;
  created_at: string;
  song_part?: SongPart;
  profile?: Profile;
}

export interface AttendanceRecord {
  id: string;
  profile_id: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  marked_by: string | null;
  created_at: string;
  profile?: Profile;
}

export interface ExcusedAbsence {
  id: string;
  profile_id: string;
  date_of_absence: string; // YYYY-MM-DD
  reason: string;
  status: ExcusedAbsenceStatus;
  created_at: string;
  profile?: Profile;
}

export type EventType =
  | 'rehearsal'
  | 'parade'
  | 'performance'
  | 'competition'
  | 'clinic'
  | 'inspection';

export interface CalendarEvent {
  id: string;
  title: string;
  event_type: EventType;
  date: string; // YYYY-MM-DD
  start_time: string; // e.g. '18:30'
  end_time: string; // e.g. '21:00' for band, '21:15' for parade
  location: string;
  dress_code?: string;
  notes?: string;
  created_at: string;
}

// Assigned music item aggregated for cadet view
export interface CadetAssignedMusic {
  assignmentId: string;
  partId: string;
  songId: string;
  title: string;
  composer: string;
  instrumentPart: string;
  fileUrl: string;
  assignedAt: string;
}

export const CADET_RANKS: { label: string; value: CadetRank; fullTitle: string }[] = [
  { label: 'Cdt', value: 'Cdt', fullTitle: 'Cadet' },
  { label: 'LAC', value: 'LAC', fullTitle: 'Leading Air Cadet' },
  { label: 'Cpl', value: 'Cpl', fullTitle: 'Corporal' },
  { label: 'FCpl', value: 'FCpl', fullTitle: 'Flight Corporal' },
  { label: 'Sgt', value: 'Sgt', fullTitle: 'Sergeant' },
  { label: 'FSgt', value: 'FSgt', fullTitle: 'Flight Sergeant' },
  { label: 'WO2', value: 'WO2', fullTitle: 'Warrant Officer 2nd Class' },
  { label: 'WO1', value: 'WO1', fullTitle: 'Warrant Officer 1st Class' },
  { label: 'CV', value: 'CV', fullTitle: 'Civilian Volunteer' },
  { label: 'CI', value: 'CI', fullTitle: 'Civilian Instructor' },
  { label: 'OCdt', value: 'OCdt', fullTitle: 'Officer Cadet' },
  { label: '2Lt', value: '2Lt', fullTitle: '2nd Lieutenant' },
  { label: 'Lt', value: 'Lt', fullTitle: 'Lieutenant' },
  { label: 'Capt', value: 'Capt', fullTitle: 'Captain' },
  { label: 'Maj', value: 'Maj', fullTitle: 'Major' },
];

export const STANDARD_INSTRUMENTS = [
  'Flute / Piccolo',
  'Oboe',
  'Clarinet',
  'Bass Clarinet',
  'Alto Saxophone',
  'Tenor Saxophone',
  'Baritone Saxophone',
  'Trumpet',
  'French Horn',
  'Trombone',
  'Bass Trombone / Euphonium',
  'Tuba / Sousaphone',
  'Snare Drum',
  'Bass Drum / Cymbals',
  'Glockenspiel / Mallets',
  'Drum Major',
  'Director of Music',
  'TBD / Unsure',
];