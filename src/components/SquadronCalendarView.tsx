import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Tag,
  Plus,
  Trash2,
  CheckSquare,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  CalendarDays,
} from 'lucide-react';
import { CalendarEvent, EventType } from '../types/database';

interface SquadronCalendarViewProps {
  isAdmin: boolean;
  calendarEvents: CalendarEvent[];
  onAddEvent: (eventData: Omit<CalendarEvent, 'id' | 'created_at'>) => Promise<boolean>;
  onDeleteEvent: (id: string, title: string, subtitle?: string) => void;
  onSelectRehearsalDate?: (date: string) => void;
}

export const SquadronCalendarView: React.FC<SquadronCalendarViewProps> = ({
  isAdmin,
  calendarEvents,
  onAddEvent,
  onDeleteEvent,
  onSelectRehearsalDate,
}) => {
  // Filter state
  const [filterType, setFilterType] = useState<string>('all');
  
 // Month navigation: default to the current month
const today = new Date();
const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());

  // Add Event Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('Band Practice');
  const [eventType, setEventType] = useState<EventType>('rehearsal');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));;
  const [startTime, setStartTime] = useState('18:30');
  const [endTime, setEndTime] = useState('21:00');
  const [location, setLocation] = useState('Walter Moberly Elementary Gym');
  const [dressCode, setDressCode] = useState('Appropriate Civilian Clothing');
  const [notes, setNotes] = useState('N/A');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Month grid calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun

  // Filtered events
  const filteredEvents = calendarEvents.filter(evt => {
    if (filterType === 'all') return true;
    return evt.event_type === filterType;
  }).sort((a, b) => a.date.localeCompare(b.date));

  // Events in current viewed month
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const eventsInCurrentMonth = calendarEvents.filter(evt => evt.date.startsWith(monthPrefix));

  // Quick preset application for the Add Event Form
  const applyPreset = (preset: 'band' | 'parade' | 'clinic' | 'acr') => {
    if (preset === 'band') {
      setTitle('Band Practice');
      setEventType('rehearsal');
      setStartTime('18:30');
      setEndTime('21:00');
      setLocation('Walter Moberly Elementary Gym');
      setDressCode('Appropriate Civilian Clothing');
      setNotes('N/A');
    } else if (preset === 'parade') {
      setTitle('Squadron Parade Night');
      setEventType('parade');
      setStartTime('18:30');
      setEndTime('21:15');
      setLocation('Walter Moberly Elementary Gym');
      setDressCode('C1 Full Dress Uniform / C5 Field Training Uniform');
      setNotes('N/A');
    } else if (preset === 'clinic') {
      setTitle('Regional Cadet Band Clinic');
      setEventType('clinic');
      setStartTime('09:00');
      setEndTime('16:00');
      setLocation('Seaforth Armoury Hoffmeister Building');
      setDressCode('Appropriate Civilian Clothing');
      setNotes('N/A');
    } else if (preset === 'acr') {
      setTitle('Annual Ceremonial Review (ACR)');
      setEventType('performance');
      setStartTime('13:00');
      setEndTime('17:00');
      setLocation('Seaforth Armoury Hoffmeister Building');
      setDressCode('C1 Full Dress Uniform');
      setNotes('Squadron Annual Inspection & Final Parade.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setIsSubmitting(true);
    const success = await onAddEvent({
      title: title.trim(),
      event_type: eventType,
      date,
      start_time: startTime,
      end_time: endTime,
      location: location.trim(),
      dress_code: dressCode.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setIsSubmitting(false);
    if (!success) {
      window.alert('Could not save this calendar event. Check the Supabase permissions and browser console for the database error.');
      return;
    }
    setIsAddOpen(false);
  };

  // iCal download generator
  const downloadIcs = (event: CalendarEvent) => {
    const startStr = event.date.replace(/-/g, '') + 'T' + event.start_time.replace(/:/g, '') + '00';
    const endStr = event.date.replace(/-/g, '') + 'T' + event.end_time.replace(/:/g, '') + '00';
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//888 Avenger Squadron Band//EN',
      'BEGIN:VEVENT',
      `SUMMARY:888 Avenger - ${event.title}`,
      `DESCRIPTION:${(event.notes || '') + (event.dress_code ? ' | Dress: ' + event.dress_code : '')}`,
      `LOCATION:${event.location}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${event.date}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getBadgeForType = (type: EventType) => {
    switch (type) {
      case 'rehearsal':
        return { label: 'Band Rehearsal (18:30-21:00)', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'parade':
        return { label: 'Parade Night (18:30-21:15)', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'performance':
        return { label: 'Performance / ACR', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'competition':
        return { label: 'Band Competition', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'clinic':
        return { label: 'Music Clinic', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'inspection':
        return { label: 'Command Inspection', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: 'Squadron Event', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-heading">
                  888 Avenger Squadron & Band Calendar
                </h2>
                <p className="text-xs text-slate-500">
                  Official Rehearsals (18:30–21:00), Squadron Parades (18:30–21:15), Ceremonials & Masterclasses
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Date / Event</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Squadron Timing Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block">Band Rehearsals:</span>
              <span className="text-slate-600 font-mono text-[11px]">Wednesdays 18:30 – 21:00 hrs</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block">Squadron Parade:</span>
              <span className="text-slate-600 font-mono text-[11px]">Fridays 18:30 – 21:15 hrs</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 sm:col-span-2 md:col-span-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block">Location:</span>
              <span className="text-slate-600 text-[11px] truncate">Walter Moberly Elementary School Gym</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase">Filter:</span>
          {[
            { id: 'all', label: `All (${calendarEvents.length})` },
            { id: 'rehearsal', label: `Band Rehearsals (${calendarEvents.filter(e => e.event_type === 'rehearsal').length})` },
            { id: 'parade', label: `Parade Nights (${calendarEvents.filter(e => e.event_type === 'parade').length})` },
            { id: 'performance', label: `Performances & ACR (${calendarEvents.filter(e => e.event_type === 'performance').length})` },
            { id: 'clinic', label: `Clinics & Training (${calendarEvents.filter(e => ['clinic', 'competition'].includes(e.event_type)).length})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === f.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Calendar & Event Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Month Grid (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-slate-900">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                 const today = new Date();
                setCurrentYear(today.getFullYear());
              setCurrentMonth(today.getMonth());
            }}
                className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 uppercase font-mono">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank cells for padding */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="h-10 rounded-xl bg-slate-50/50" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = calendarEvents.filter(e => e.date === dateStr);
              const hasEvents = dayEvents.length > 0;
              const isToday = dateStr === new Date().toISOString().slice(0, 10);

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    if (isAdmin) {
                      setDate(dateStr);
                      setIsAddOpen(true);
                    }
                  }}
                  className={`h-11 rounded-xl p-1 flex flex-col items-center justify-between cursor-pointer border transition-all ${
                    hasEvents
                      ? 'bg-sky-50/60 border-sky-200 hover:bg-sky-100 hover:border-sky-300'
                      : 'border-slate-100 hover:bg-slate-50'
                  } ${isToday ? 'ring-2 ring-sky-500 ring-offset-1' : ''}`}
                  title={hasEvents ? `${dayEvents.map(e => e.title).join(', ')}` : isAdmin ? `Click to add event for ${dateStr}` : dateStr}
                >
                  <span className={`text-[11px] font-bold leading-tight ${hasEvents ? 'text-sky-900' : 'text-slate-700'}`}>
                    {dayNum}
                  </span>
                  {hasEvents && (
                    <div className="flex gap-0.5">
                      {dayEvents.slice(0, 3).map(e => {
                        let dotColor = 'bg-sky-500';
                        if (e.event_type === 'parade') dotColor = 'bg-emerald-500';
                        if (e.event_type === 'performance') dotColor = 'bg-amber-500';
                        if (e.event_type === 'clinic') dotColor = 'bg-indigo-500';
                        return <span key={e.id} className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Month Summary */}
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>{eventsInCurrentMonth.length} scheduled event{eventsInCurrentMonth.length === 1 ? '' : 's'} in {monthNames[currentMonth]}</span>
            {isAdmin && (
              <span className="text-[11px] text-sky-600 font-semibold cursor-pointer" onClick={() => setIsAddOpen(true)}>
                + New Date
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Detailed Event Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span>Scheduled Rehearsals & Dates</span>
              <span className="text-xs font-mono font-normal text-slate-400">({filteredEvents.length})</span>
            </h3>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Date</span>
              </button>
            )}
          </div>

          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              No calendar events found matching the selected filter.
            </div>
          ) : (
            filteredEvents.map(evt => {
              const badge = getBadgeForType(evt.event_type);
              const dateObj = new Date(`${evt.date}T12:00:00`);
              const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
              const dayNumber = dateObj.getDate();
              const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row gap-4 items-start justify-between"
                >
                  {/* Left Date Block & Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Date Block */}
                    <div className="w-14 h-16 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 shadow-sm border border-slate-800">
                      <span className="text-[10px] font-bold text-sky-400 uppercase font-mono tracking-wider">
                        {weekday}
                      </span>
                      <span className="text-lg font-black font-squadron-num leading-tight">
                        {dayNumber}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">
                        {monthShort}
                      </span>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-heading font-bold text-slate-900 text-sm">
                          {evt.title}
                        </h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Time & Location */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-mono font-medium text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span>{evt.start_time} – {evt.end_time} hrs</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{evt.location}</span>
                        </span>
                      </div>

                      {/* Dress Code */}
                      {evt.dress_code && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <Tag className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="font-semibold text-slate-700">Dress:</span>
                          <span className="text-slate-600">{evt.dress_code}</span>
                        </div>
                      )}

                      {/* Notes / Orders */}
                      {evt.notes && (
                        <p className="text-xs text-slate-500 pt-0.5 italic">
                          {evt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions for this Event */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                    {/* Take Roll-Call Button (Admin) */}
                    {isAdmin && onSelectRehearsalDate && (
                      <button
                        type="button"
                        onClick={() => onSelectRehearsalDate(evt.date)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition-colors"
                        title={`Take Roll-Call for ${evt.date}`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Roll-Call</span>
                      </button>
                    )}

                    {/* Download iCal */}
                    <button
                      type="button"
                      onClick={() => downloadIcs(evt)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Add to personal calendar (.ics)"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Delete Event Button (Admin) */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() =>
                          onDeleteEvent(
                            evt.id,
                            evt.title,
                            `Date: ${evt.date} (${evt.start_time} - ${evt.end_time})`
                          )
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete date from calendar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD CALENDAR EVENT / REHEARSAL DATE (ADMIN ONLY) */}
      {/* ========================================================================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">
                    Add Rehearsal / Squadron Date
                  </h3>
                  <p className="text-xs text-slate-500">
                    Schedule band practices, parades, clinics, or performances
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Quick Timing Presets
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => applyPreset('band')}
                  className="px-3 py-2 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100 text-sky-800 text-left font-semibold transition-colors flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                  <div>
                    <span className="block font-bold">Band Rehearsal</span>
                    <span className="text-[10px] text-sky-600 font-mono">18:30 – 21:00</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset('parade')}
                  className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-left font-semibold transition-colors flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <div>
                    <span className="block font-bold">Squadron Parade</span>
                    <span className="text-[10px] text-emerald-600 font-mono">18:30 – 21:15</span>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Wednesday Band Rehearsal"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Event Type *
                  </label>
                  <select
                    value={eventType}
                    onChange={e => setEventType(e.target.value as EventType)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="rehearsal">Band Rehearsal</option>
                    <option value="parade">Squadron Parade Night</option>
                    <option value="performance">Band Performance / Gig</option>
                    <option value="competition">Band Competition</option>
                    <option value="clinic">Music Clinic / Masterclass</option>
                    <option value="inspection">Command Inspection / ACR</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Bessborough Armoury - Band Room"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Dress Code / Uniform
                </label>
                <input
                  type="text"
                  value={dressCode}
                  onChange={e => setDressCode(e.target.value)}
                  placeholder="e.g. Band Polo & Civvies / C1 Full Ceremonial / C2 Duty"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Cadet Orders / Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="What sheet music to bring, warm-up instructions, or briefing..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Event to Calendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
