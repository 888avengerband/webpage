import React, { useState, useEffect } from 'react';
import { X, Users, Check, Music } from 'lucide-react';
import { SongPart, SheetMusic } from '../types/database';
import { useBandData } from '../context/BandDataContext';

interface AssignPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: SongPart | null;
  song: SheetMusic | null;
}

export const AssignPartModal: React.FC<AssignPartModalProps> = ({
  isOpen,
  onClose,
  part,
  song,
}) => {
  const { profiles, partAssignments, assignCadetsToPart } = useBandData();
  const [selectedCadetIds, setSelectedCadetIds] = useState<string[]>([]);
  const [filterInstrument, setFilterInstrument] = useState<string>('all');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (part) {
      const assigned = partAssignments
        .filter(pa => pa.song_part_id === part.id)
        .map(pa => pa.profile_id);
      setSelectedCadetIds(assigned);
    }
  }, [part, partAssignments]);

  if (!isOpen || !part || !song) return null;

  const handleToggle = (id: string) => {
    setSelectedCadetIds(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await assignCadetsToPart(part.id, selectedCadetIds);
    setIsSaving(false);
    onClose();
  };

  // Include both admins and members in part assignments
  const eligibleProfiles = profiles.filter(p => p.role === 'admin' || p.role === 'member');
  const instruments = Array.from(new Set(eligibleProfiles.map(p => p.instrument)));

  const filteredCadets = eligibleProfiles.filter(p => {
    if (filterInstrument === 'all') return true;
    return p.instrument === filterInstrument;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assign Cadets to Part</h3>
              <p className="text-xs text-slate-500">
                {song.title} · <span className="text-sky-700 font-semibold">{part.instrument_part}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="text-slate-500">Filter:</label>
              <select
                value={filterInstrument}
                onChange={e => setFilterInstrument(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Instruments ({eligibleProfiles.length})</option>
                {instruments.map(inst => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCadetIds(filteredCadets.map(c => c.id))}
                className="text-sky-600 hover:underline font-semibold"
              >
                Select Filtered
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => setSelectedCadetIds([])}
                className="text-slate-400 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-1">
            {filteredCadets.map(cadet => {
              const isAssigned = selectedCadetIds.includes(cadet.id);
              return (
                <label
                  key={cadet.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    isAssigned
                      ? 'bg-sky-100 text-sky-900 font-medium'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isAssigned}
                      onChange={() => handleToggle(cadet.id)}
                      className="rounded border-slate-300 text-sky-600 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-sky-700 mr-1">{cadet.rank}</span>
                      {cadet.first_name} {cadet.last_name}
                      {cadet.role === 'admin' && <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">Admin</span>}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{cadet.instrument}</span>
                </label>
              );
            })}
          </div>

          <p className="text-slate-500">
            Assigned to <span className="font-bold text-sky-700 font-mono tabular-nums">{selectedCadetIds.length}</span> cadet{selectedCadetIds.length === 1 ? '' : 's'}. They will immediately see these parts in their locker.
          </p>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors shadow-sm"
            >
              {isSaving ? 'Saving...' : 'Update Assignments'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
