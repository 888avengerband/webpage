import React, { useState } from 'react';
import { X, UserPlus, Shield, Music, Phone, Mail, Award } from 'lucide-react';
import { CadetRank, CADET_RANKS, STANDARD_INSTRUMENTS, UserRole } from '../types/database';
import { useBandData } from '../context/BandDataContext';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose }) => {
  const { addMember } = useBandData();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [rank, setRank] = useState<CadetRank>('Cdt');
  const [cadet365Email, setCadet365Email] = useState('');
  const [instrument, setInstrument] = useState<string>(STANDARD_INSTRUMENTS[0]);
  const [role, setRole] = useState<UserRole>('member');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide first and last name.');
      return;
    }

    if (!cadet365Email.trim() || !cadet365Email.includes('@')) {
      setError('Please provide a valid Cadet365 email address.');
      return;
    }

    setIsSubmitting(true);
    const res = await addMember({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      rank,
      cadet365_email: cadet365Email.trim().toLowerCase(),
      instrument,
      role,
      phone: phone.trim() || null,
    });

    setIsSubmitting(false);

    if (res.success) {
      setFirstName('');
      setLastName('');
      setCadet365Email('');
      setPhone('');
      onClose();
    } else {
      setError(res.error || 'Failed to add member to roster.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add New Band Member</h3>
              <p className="text-xs text-slate-500">888 Avenger Squadron Band Roster</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Rank</label>
              <select
                value={rank}
                onChange={e => setRank(e.target.value as CadetRank)}
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
              <label className="block font-medium text-slate-700 mb-1">Portal Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
              >
                <option value="member">Member (Musician)</option>
                <option value="admin">Admin (Officer / Band Senior)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Cadet365 / Defense Email *</label>
            <input
              type="email"
              required
              value={cadet365Email}
              onChange={e => setCadet365Email(e.target.value)}
              placeholder="NPark123@cdt.cadets.gc.ca or bob.ross@cadets.gc.ca"
              className="w-full px-3 py-2 font-mono bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Format: <span className="font-mono text-sky-600">NPark123@cdt.cadets.gc.ca</span> for cadets · <span className="font-mono text-sky-600">bob.ross@cadets.gc.ca</span> for officers, CIs, and volunteers
            </p>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Primary Instrument</label>
            <select
              value={instrument}
              onChange={e => setInstrument(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
            >
              {STANDARD_INSTRUMENTS.map(inst => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(604) 555-0199"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add to Roster'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
