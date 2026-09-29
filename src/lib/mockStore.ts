import {
  Profile,
  SheetMusic,
  SongPart,
  PartAssignment,
  AttendanceRecord,
  ExcusedAbsence,
  CalendarEvent,
} from '../types/database';

const LOCAL_STORAGE_KEY_PREFIX = '888_avenger_store_';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'u-admin-01',
    first_name: 'David',
    last_name: 'Vance',
    rank: 'Capt',
    cadet365_email: 'david.vance@cadets.gc.ca',
    instrument: 'Director of Music',
    role: 'admin',
    phone: '(604) 555-0188',
    created_at: '2026-01-10T18:00:00Z',
  },
  {
    id: 'u-admin-02',
    first_name: 'Ethan',
    last_name: 'Chen',
    rank: 'WO2',
    cadet365_email: 'EChen421@cdt.cadets.gc.ca',
    instrument: 'Drum Major',
    role: 'admin',
    phone: '(604) 555-0142',
    created_at: '2026-01-12T18:00:00Z',
  },
  {
    id: 'u-member-01',
    first_name: 'Sarah',
    last_name: 'Tremblay',
    rank: 'FSgt',
    cadet365_email: 'STremblay819@cdt.cadets.gc.ca',
    instrument: 'Flute / Piccolo',
    role: 'member',
    phone: '(604) 555-0199',
    created_at: '2026-01-15T18:00:00Z',
  },
  {
    id: 'u-member-02',
    first_name: 'Marcus',
    last_name: 'Wong',
    rank: 'Sgt',
    cadet365_email: 'MWong302@cdt.cadets.gc.ca',
    instrument: 'Clarinet',
    role: 'member',
    phone: '(604) 555-0211',
    created_at: '2026-01-18T18:00:00Z',
  },
  {
    id: 'u-member-03',
    first_name: 'Aisha',
    last_name: 'Patel',
    rank: 'Cpl',
    cadet365_email: 'APatel154@cdt.cadets.gc.ca',
    instrument: 'Clarinet',
    role: 'member',
    phone: '(604) 555-0233',
    created_at: '2026-02-01T18:00:00Z',
  },
  {
    id: 'u-member-04',
    first_name: 'Lucas',
    last_name: 'Miller',
    rank: 'FCpl',
    cadet365_email: 'LMiller773@cdt.cadets.gc.ca',
    instrument: 'Alto Saxophone',
    role: 'member',
    phone: '(604) 555-0255',
    created_at: '2026-02-05T18:00:00Z',
  },
  {
    id: 'u-member-05',
    first_name: 'Kevin',
    last_name: 'Zhao',
    rank: 'LAC',
    cadet365_email: 'KZhao609@cdt.cadets.gc.ca',
    instrument: 'French Horn',
    role: 'member',
    phone: '(604) 555-0277',
    created_at: '2026-02-10T18:00:00Z',
  },
  {
    id: 'u-member-06',
    first_name: 'Liam',
    last_name: "O'Connor",
    rank: 'Sgt',
    cadet365_email: 'LOConnor481@cdt.cadets.gc.ca',
    instrument: 'Trombone',
    role: 'member',
    phone: '(604) 555-0288',
    created_at: '2026-02-12T18:00:00Z',
  },
  {
    id: 'u-member-07',
    first_name: 'Noah',
    last_name: 'Jackson',
    rank: 'Cpl',
    cadet365_email: 'NJackson228@cdt.cadets.gc.ca',
    instrument: 'Snare Drum',
    role: 'member',
    phone: '(604) 555-0299',
    created_at: '2026-02-15T18:00:00Z',
  },
  {
    id: 'u-member-08',
    first_name: 'Chloe',
    last_name: 'Dubois',
    rank: 'Cdt',
    cadet365_email: 'CDubois935@cdt.cadets.gc.ca',
    instrument: 'Bass Drum / Cymbals',
    role: 'member',
    phone: '(604) 555-0311',
    created_at: '2026-02-20T18:00:00Z',
  },
];

export const INITIAL_SHEET_MUSIC: SheetMusic[] = [
  {
    id: 'song-01',
    title: 'The Great Escape (Main March)',
    composer: 'Elmer Bernstein / Arr. Robert Smith',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'song-02',
    title: 'RCAF March Past',
    composer: 'Sir Walford Davies (Official RCAF March)',
    created_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'song-03',
    title: 'Heart of Oak',
    composer: 'Dr. William Boyce / Arr. D. Higgins',
    created_at: '2026-01-22T10:00:00Z',
  },
  {
    id: 'song-04',
    title: 'O Canada (Ceremonial Key of Bb)',
    composer: 'Calixa Lavallée / Arr. C. Godfrey',
    created_at: '2026-01-25T10:00:00Z',
  },
  {
    id: 'song-05',
    title: 'Avenger Fanfare & Quickstep',
    composer: 'Maj. D. A. Campbell (Retd)',
    created_at: '2026-02-01T10:00:00Z',
  },
];

// Public sample PDFs for reliable viewing/downloading in sandbox
const SAMPLE_PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

export const INITIAL_SONG_PARTS: SongPart[] = [
  {
    id: 'part-01-tpt1',
    song_id: 'song-01',
    instrument_part: 'Trumpet 1',
    file_url: SAMPLE_PDF_URL,
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'part-01-flute',
    song_id: 'song-01',
    instrument_part: 'Flute / Piccolo',
    file_url: SAMPLE_PDF_URL,
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'part-01-clar1',
    song_id: 'song-01',
    instrument_part: 'Clarinet 1',
    file_url: SAMPLE_PDF_URL,
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'part-01-clar2',
    song_id: 'song-01',
    instrument_part: 'Clarinet 2',
    file_url: SAMPLE_PDF_URL,
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'part-01-perc',
    song_id: 'song-01',
    instrument_part: 'Percussion / Snare & Bass',
    file_url: SAMPLE_PDF_URL,
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'part-02-score',
    song_id: 'song-02',
    instrument_part: 'Full Conductor Score',
    file_url: SAMPLE_PDF_URL,
    created_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'part-02-asax',
    song_id: 'song-02',
    instrument_part: 'Alto Saxophone 1',
    file_url: SAMPLE_PDF_URL,
    created_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'part-02-horn',
    song_id: 'song-02',
    instrument_part: 'French Horn',
    file_url: SAMPLE_PDF_URL,
    created_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'part-02-tbone',
    song_id: 'song-02',
    instrument_part: 'Trombone 1',
    file_url: SAMPLE_PDF_URL,
    created_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'part-03-tpt',
    song_id: 'song-03',
    instrument_part: 'Trumpet 1',
    file_url: SAMPLE_PDF_URL,
    created_at: '2026-01-22T10:00:00Z',
  },
  {
    id: 'part-03-flute',
    song_id: 'song-03',
    instrument_part: 'Flute / Piccolo',
    file_url: SAMPLE_PDF_URL,
    created_at: '2026-01-22T10:00:00Z',
  },
  {
    id: 'part-04-score',
    song_id: 'song-04',
    instrument_part: 'Full Band Score (Bb)',
    file_url: SAMPLE_PDF_URL,
    created_at: '2026-01-25T10:00:00Z',
  },
];

export const INITIAL_ASSIGNMENTS: PartAssignment[] = [
  // Sarah Tremblay (Flute) -> The Great Escape Flute, Heart of Oak Flute
  { id: 'pa-01', song_part_id: 'part-01-flute', profile_id: 'u-member-01', created_at: '2026-01-16T12:00:00Z' },
  { id: 'pa-02', song_part_id: 'part-03-flute', profile_id: 'u-member-01', created_at: '2026-01-23T12:00:00Z' },
  // Marcus Wong (Clarinet 1) -> The Great Escape Clarinet 1
  { id: 'pa-03', song_part_id: 'part-01-clar1', profile_id: 'u-member-02', created_at: '2026-01-16T12:00:00Z' },
  // Aisha Patel (Clarinet 2) -> The Great Escape Clarinet 2
  { id: 'pa-04', song_part_id: 'part-01-clar2', profile_id: 'u-member-03', created_at: '2026-01-16T12:00:00Z' },
  // Lucas Miller (Alto Sax) -> RCAF March Past Alto Sax
  { id: 'pa-05', song_part_id: 'part-02-asax', profile_id: 'u-member-04', created_at: '2026-01-21T12:00:00Z' },
  // Kevin Zhao (Horn) -> RCAF March Past French Horn
  { id: 'pa-06', song_part_id: 'part-02-horn', profile_id: 'u-member-05', created_at: '2026-01-21T12:00:00Z' },
  // Liam O'Connor (Trombone) -> RCAF March Past Trombone 1
  { id: 'pa-07', song_part_id: 'part-02-tbone', profile_id: 'u-member-06', created_at: '2026-01-21T12:00:00Z' },
  // Noah Jackson & Chloe Dubois (Percussion) -> The Great Escape Percussion
  { id: 'pa-08', song_part_id: 'part-01-perc', profile_id: 'u-member-07', created_at: '2026-01-16T12:00:00Z' },
  { id: 'pa-09', song_part_id: 'part-01-perc', profile_id: 'u-member-08', created_at: '2026-01-16T12:00:00Z' },
  // Ethan Chen (WO2 Trumpet)
  { id: 'pa-10', song_part_id: 'part-01-tpt1', profile_id: 'u-admin-02', created_at: '2026-01-16T12:00:00Z' },
  { id: 'pa-11', song_part_id: 'part-03-tpt', profile_id: 'u-admin-02', created_at: '2026-01-23T12:00:00Z' },
  // Conductor Scores assigned to Capt. Vance
  { id: 'pa-12', song_part_id: 'part-02-score', profile_id: 'u-admin-01', created_at: '2026-01-20T12:00:00Z' },
  { id: 'pa-13', song_part_id: 'part-04-score', profile_id: 'u-admin-01', created_at: '2026-01-25T12:00:00Z' },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // 2026-09-02 (Rehearsal 1)
  { id: 'att-01', profile_id: 'u-member-01', date: '2026-09-02', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-02T21:00:00Z' },
  { id: 'att-02', profile_id: 'u-member-02', date: '2026-09-02', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-02T21:00:00Z' },
  { id: 'att-03', profile_id: 'u-member-03', date: '2026-09-02', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-02T21:00:00Z' },
  { id: 'att-04', profile_id: 'u-member-04', date: '2026-09-02', status: 'Late', marked_by: 'u-admin-01', created_at: '2026-09-02T21:00:00Z' },
  { id: 'att-05', profile_id: 'u-member-05', date: '2026-09-02', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-02T21:00:00Z' },
  { id: 'att-06', profile_id: 'u-member-06', date: '2026-09-02', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-02T21:00:00Z' },
  { id: 'att-07', profile_id: 'u-member-07', date: '2026-09-02', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-02T21:00:00Z' },
  { id: 'att-08', profile_id: 'u-member-08', date: '2026-09-02', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-02T21:00:00Z' },

  // 2026-09-09 (Rehearsal 2)
  { id: 'att-11', profile_id: 'u-member-01', date: '2026-09-09', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-09T21:00:00Z' },
  { id: 'att-12', profile_id: 'u-member-02', date: '2026-09-09', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-09T21:00:00Z' },
  { id: 'att-13', profile_id: 'u-member-03', date: '2026-09-09', status: 'Absent Excused - AE', marked_by: 'u-admin-01', created_at: '2026-09-09T21:00:00Z' },
  { id: 'att-14', profile_id: 'u-member-04', date: '2026-09-09', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-09T21:00:00Z' },
  { id: 'att-15', profile_id: 'u-member-05', date: '2026-09-09', status: 'Absent', marked_by: 'u-admin-01', created_at: '2026-09-09T21:00:00Z' },
  { id: 'att-16', profile_id: 'u-member-06', date: '2026-09-09', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-09T21:00:00Z' },
  { id: 'att-17', profile_id: 'u-member-07', date: '2026-09-09', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-09T21:00:00Z' },
  { id: 'att-18', profile_id: 'u-member-08', date: '2026-09-09', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-09T21:00:00Z' },

  // 2026-09-16 (Rehearsal 3)
  { id: 'att-21', profile_id: 'u-member-01', date: '2026-09-16', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-16T21:00:00Z' },
  { id: 'att-22', profile_id: 'u-member-02', date: '2026-09-16', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-16T21:00:00Z' },
  { id: 'att-23', profile_id: 'u-member-03', date: '2026-09-16', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-16T21:00:00Z' },
  { id: 'att-24', profile_id: 'u-member-04', date: '2026-09-16', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-16T21:00:00Z' },
  { id: 'att-25', profile_id: 'u-member-05', date: '2026-09-16', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-16T21:00:00Z' },
  { id: 'att-26', profile_id: 'u-member-06', date: '2026-09-16', status: 'Late', marked_by: 'u-admin-01', created_at: '2026-09-16T21:00:00Z' },
  { id: 'att-27', profile_id: 'u-member-07', date: '2026-09-16', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-16T21:00:00Z' },
  { id: 'att-28', profile_id: 'u-member-08', date: '2026-09-16', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-16T21:00:00Z' },

  // 2026-09-23 (Rehearsal 4)
  { id: 'att-31', profile_id: 'u-member-01', date: '2026-09-23', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-23T21:00:00Z' },
  { id: 'att-32', profile_id: 'u-member-02', date: '2026-09-23', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-23T21:00:00Z' },
  { id: 'att-33', profile_id: 'u-member-03', date: '2026-09-23', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-23T21:00:00Z' },
  { id: 'att-34', profile_id: 'u-member-04', date: '2026-09-23', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-23T21:00:00Z' },
  { id: 'att-35', profile_id: 'u-member-05', date: '2026-09-23', status: 'Absent Excused - AE', marked_by: 'u-admin-01', created_at: '2026-09-23T21:00:00Z' },
  { id: 'att-36', profile_id: 'u-member-06', date: '2026-09-23', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-23T21:00:00Z' },
  { id: 'att-37', profile_id: 'u-member-07', date: '2026-09-23', status: 'Present', marked_by: 'u-admin-01', created_at: '2026-09-23T21:00:00Z' },
  { id: 'att-38', profile_id: 'u-member-08', date: '2026-09-23', status: 'Late', marked_by: 'u-admin-01', created_at: '2026-09-23T21:00:00Z' },
];

export const INITIAL_EXCUSED_ABSENCES: ExcusedAbsence[] = [
  {
    id: 'ea-01',
    profile_id: 'u-member-03',
    date_of_absence: '2026-09-30',
    reason: 'Sir Winston Churchill Secondary (Vancouver) IB Chemistry midterm examination and laboratory project presentation.',
    status: 'Pending',
    created_at: '2026-09-26T14:30:00Z',
  },
  {
    id: 'ea-02',
    profile_id: 'u-member-05',
    date_of_absence: '2026-09-30',
    reason: 'Cadet Regional Marksmanship training competition preliminary trials in Chilliwack.',
    status: 'Pending',
    created_at: '2026-09-27T09:15:00Z',
  },
  {
    id: 'ea-03',
    profile_id: 'u-member-04',
    date_of_absence: '2026-09-23',
    reason: 'Family bereavement attendance in Victoria BC.',
    status: 'Approved',
    created_at: '2026-09-20T11:00:00Z',
  },
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-01',
    title: 'Wednesday Band Rehearsal',
    event_type: 'rehearsal',
    date: '2026-09-30',
    start_time: '18:30',
    end_time: '21:00',
    location: 'Bessborough Armoury - Band Room',
    dress_code: 'Band Polo / Squadron Civvies & Instrument',
    notes: 'Warm-ups, The Maple Leaf Forever run-through, sectional drill with Drum Major.',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'evt-02',
    title: 'Friday Squadron Parade Night',
    event_type: 'parade',
    date: '2026-10-02',
    start_time: '18:30',
    end_time: '21:15',
    location: 'Main Drill Hall & Parade Square',
    dress_code: 'C2 Routine Duty Uniform (Polished Boots)',
    notes: 'Squadron muster, march-past accompaniment, inspection by Commanding Officer.',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'evt-03',
    title: 'Wednesday Band Rehearsal & Sectionals',
    event_type: 'rehearsal',
    date: '2026-10-07',
    start_time: '18:30',
    end_time: '21:00',
    location: 'Bessborough Armoury - Band Room',
    dress_code: 'Band Polo / Civvies',
    notes: 'Focus on Clarinet & Trumpet harmonies for Heart of Oak and Colonel Bogey.',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'evt-04',
    title: 'Friday Squadron Parade Night',
    event_type: 'parade',
    date: '2026-10-09',
    start_time: '18:30',
    end_time: '21:15',
    location: 'Main Drill Hall & Parade Square',
    dress_code: 'C2 Routine Duty Uniform',
    notes: 'Parade night 18:30-21:15. Band performs general salute and march-off.',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'evt-05',
    title: 'Wednesday Band Rehearsal',
    event_type: 'rehearsal',
    date: '2026-10-14',
    start_time: '18:30',
    end_time: '21:00',
    location: 'Bessborough Armoury - Band Room',
    dress_code: 'Band Polo / Civvies',
    notes: 'Percussion cadence alignment with Drum Major Ethan Chen.',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'evt-06',
    title: 'Friday Squadron Parade Night',
    event_type: 'parade',
    date: '2026-10-16',
    start_time: '18:30',
    end_time: '21:15',
    location: 'Main Drill Hall & Parade Square',
    dress_code: 'C2 Routine Duty Uniform',
    notes: 'Squadron announcements, band muster in Annex.',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'evt-07',
    title: 'Wednesday Band Rehearsal & Sight-Reading',
    event_type: 'rehearsal',
    date: '2026-10-21',
    start_time: '18:30',
    end_time: '21:00',
    location: 'Bessborough Armoury - Band Room',
    dress_code: 'Band Polo / Civvies',
    notes: 'Preparing Avenger Fanfare & Quickstep. Bring pencil and tuner.',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'evt-08',
    title: 'Lower Mainland Tri-Service Band Clinic',
    event_type: 'clinic',
    date: '2026-10-24',
    start_time: '09:00',
    end_time: '16:00',
    location: 'Seaforth Armoury (Vancouver)',
    dress_code: 'Band Polo & Squadron Tunics',
    notes: 'Regional masterclass with Canadian Armed Forces military band directors.',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'evt-09',
    title: 'Wednesday Band Rehearsal',
    event_type: 'rehearsal',
    date: '2026-10-28',
    start_time: '18:30',
    end_time: '21:00',
    location: 'Bessborough Armoury - Band Room',
    dress_code: 'Band Polo / Civvies',
    notes: 'Remembrance Day repertoire intensive: The Last Post, Rouse, O Canada, God Save the King.',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'evt-10',
    title: 'Vancouver Civic Remembrance Day Ceremony',
    event_type: 'performance',
    date: '2026-11-11',
    start_time: '09:30',
    end_time: '12:30',
    location: 'Vancouver Victory Square Cenotaph',
    dress_code: 'C1 Full Ceremonial (Medals, Poppies, White Belts)',
    notes: 'Full squadron band participation in municipal Remembrance Day parade and memorial service.',
    created_at: '2026-09-01T10:00:00Z',
  },
];

// LocalStorage helpers
export const loadFromStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage`, e);
    return fallback;
  }
};

export const normalizeProfile = (p: Profile): Profile => {
  let rank = p.rank;
  if ((rank as string) === 'Officer') {
    rank = 'Capt';
  }
  let instrument = p.instrument;
  if (instrument === 'Clarinet 1' || instrument === 'Clarinet 2') instrument = 'Clarinet';
  if (instrument === 'Alto Saxophone 1' || instrument === 'Alto Saxophone 2') instrument = 'Alto Saxophone';
  if (instrument === 'Trumpet 1' || instrument === 'Trumpet 2' || instrument === 'Trumpet 3') instrument = 'Trumpet';
  if (instrument === 'Trombone 1') instrument = 'Trombone';

  let email = p.cadet365_email;
  if (email && email.endsWith('@cadets365.ca')) {
    const namePart = email.split('@')[0];
    if (['Capt', 'Maj', 'Lt', '2Lt', 'OCdt', 'CI', 'CV'].includes(rank) || (p.role === 'admin' && p.id === 'u-admin-01')) {
      email = `${namePart}@cadets.gc.ca`;
    } else {
      const parts = namePart.split('.');
      if (parts.length >= 2) {
        const init = parts[0][0]?.toUpperCase() || 'C';
        const last = parts[1][0]?.toUpperCase() + parts[1].slice(1);
        const hash = Math.abs((p.id || '123').split('').reduce((acc, char) => acc + char.charCodeAt(0), 100)) % 900 + 100;
        email = `${init}${last}${hash}@cdt.cadets.gc.ca`;
      } else {
        email = `${namePart}@cdt.cadets.gc.ca`;
      }
    }
  }

  return {
    ...p,
    rank,
    instrument,
    cadet365_email: email,
  };
};

export const normalizeProfilesList = (list: Profile[]): Profile[] => {
  return list.map(normalizeProfile);
};

export const saveToStorage = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
};
