import React, { useState } from 'react';
import { X, Upload, Music, FileText, Users, Image as ImageIcon } from 'lucide-react';
import { STANDARD_INSTRUMENTS } from '../types/database';
import { useBandData } from '../context/BandDataContext';

interface UploadMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadMusicModal: React.FC<UploadMusicModalProps> = ({ isOpen, onClose }) => {
  const { sheetMusic, profiles, addSongWithPart, addSongPart } = useBandData();

  const [mode, setMode] = useState<'new_song' | 'existing_song'>('new_song');
  const [selectedSongId, setSelectedSongId] = useState<string>(sheetMusic[0]?.id || '');
  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [partName, setPartName] = useState(STANDARD_INSTRUMENTS[0]);
  const [customPartName, setCustomPartName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isImageFile, setIsImageFile] = useState(false);
  const [selectedCadetIds, setSelectedCadetIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  if (!isOpen) return null;

  const handleCadetToggle = (id: string) => {
    setSelectedCadetIds(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setFileName(files.map(file => file.name).join(', '));
    setIsImageFile(files.length === 1 && files[0].type.startsWith('image/'));
    setFileUrl('');
  };

  const readFileAsDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read file'));
    reader.onerror = () => reject(new Error('Could not read ' + file.name));
    reader.readAsDataURL(file);
  });

  const buildCombinedScore = async (): Promise<string> => {
    if (selectedFiles.length === 1) return readFileAsDataUrl(selectedFiles[0]);
    const files = await Promise.all(selectedFiles.map(async file => ({ name: file.name, type: file.type, data: await readFileAsDataUrl(file) })));
    const sections = files.map(file => file.type.startsWith('image/')
      ? '<section><h2>' + file.name.replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch] || ch)) + '</h2><img src="' + file.data + '" alt="' + file.name + '" /></section>'
      : '<section><h2>' + file.name.replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch] || ch)) + '</h2><iframe title="' + file.name + '" src="' + file.data + '"></iframe><p><a href="' + file.data + '" target="_blank" rel="noreferrer">Open PDF separately</a></p></section>'
    ).join('');
    const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Combined Sheet Music</title><style>body{font-family:system-ui;margin:0;background:#eef2f7;color:#172033}header{padding:16px;background:#0f172a;color:white}section{margin:16px;padding:16px;background:white;border-radius:12px;box-shadow:0 1px 4px #0002}img{max-width:100%;height:auto;display:block;margin:auto}iframe{width:100%;height:80vh;border:0}</style></head><body><header><h1>Combined Sheet Music</h1><p>' + files.length + ' files · use the sections below</p></header>' + sections + '</body></html>';
    return 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (selectedFiles.length === 0 && !fileUrl) {
      alert('Please select a PDF or image file');
      setIsSubmitting(false);
      return;
    }

    if (mode === 'new_song') {
      if (!title.trim()) {
        alert('Please enter a song title');
        setIsSubmitting(false);
        return;
      }
      const combinedFile = await buildCombinedScore();
      await addSongWithPart(title, composer, partName, customPartName.trim() || 'Main Part', combinedFile, selectedCadetIds);
    } else {
      if (!selectedSongId) {
        alert('Please choose an existing song');
        setIsSubmitting(false);
        return;
      }
      const combinedFile = await buildCombinedScore();
      await addSongPart(selectedSongId, partName, customPartName.trim() || 'Main Part', combinedFile, selectedCadetIds);
    }

    setIsSubmitting(false);
    onClose();
  };

  const memberProfiles = profiles.filter(
  p => p.role === 'admin' || p.role === 'member'
);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Upload Sheet Music & Song Part</h3>
              <p className="text-xs text-slate-500">888 Avenger Squadron Repertoire</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="px-6 pt-3 pb-2 bg-slate-50 flex gap-2 border-b border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setMode('new_song')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              mode === 'new_song'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            New Song & Part
          </button>
          <button
            type="button"
            onClick={() => setMode('existing_song')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              mode === 'existing_song'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Add Part to Existing Song
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {mode === 'new_song' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Song Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Scipio March"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Composer / Arranger</label>
                <input
                  type="text"
                  value={composer}
                  onChange={e => setComposer(e.target.value)}
                  placeholder="e.g. G.F. Handel"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-medium text-slate-700 mb-1">Select Song</label>
              <select
                value={selectedSongId}
                onChange={e => setSelectedSongId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
              >
                {sheetMusic.map(sm => (
                  <option key={sm.id} value={sm.id}>
                    {sm.title} — {sm.composer}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">Instrument *</label>
            <div className="flex gap-2">
              <select
                value={partName}
                onChange={e => setPartName(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500"
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
            <label className="block font-medium text-slate-700 mb-1">Part / Arrangement Name *</label>
            <input type="text" required value={customPartName} onChange={e => setCustomPartName(e.target.value)} placeholder="e.g. 1st Clarinet, Melody, Harmony, Solo, Page 1–3" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500" />
            <p className="text-[10px] text-slate-500 mt-1">Choose the instrument above, then name the specific part here.</p>
          </div>

          {/* File Upload Box (PDF or Image) */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Score Files (select multiple PDFs and photos)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl p-5 text-center bg-slate-50 transition-colors">
              {isImageFile && fileUrl.startsWith('data:image/') ? (
                <div className="mb-2 max-h-32 flex justify-center">
                  <img
                    src={fileUrl}
                    alt="Uploaded Score Preview"
                    className="max-h-28 object-contain rounded-lg border border-slate-200 shadow-sm"
                  />
                </div>
              ) : isImageFile ? (
                <ImageIcon className="w-7 h-7 text-sky-600 mx-auto mb-1.5" />
              ) : (
                <FileText className="w-7 h-7 text-sky-600 mx-auto mb-1.5" />
              )}
              <p className="font-semibold text-slate-800">
                {fileName ? fileName : 'Choose PDF(s) or photo(s)'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Select one or multiple files: PDF, PNG, JPG, JPEG, WebP · <code className="text-sky-700">sheet-music</code>
              </p>
              <label className="mt-3 inline-block cursor-pointer px-3.5 py-1.5 font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors shadow-sm">
                Select File(s)
                <input
                  type="file"
                  multiple
                  accept="application/pdf,image/png,image/jpeg,image/webp,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Multi-Select Assignment Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-medium text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                Assign Part to Cadets ({selectedCadetIds.length} selected)
              </label>
              <div className="flex gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedCadetIds(memberProfiles.map(p => p.id))}
                  className="text-sky-600 font-semibold hover:underline"
                >
                  Select All
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

            <div className="max-h-36 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-1">
              {memberProfiles.map(cadet => {
                const isSelected = selectedCadetIds.includes(cadet.id);
                return (
                  <label
                    key={cadet.id}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sky-100 text-sky-900 font-medium'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCadetToggle(cadet.id)}
                        className="rounded border-slate-300 text-sky-600 focus:ring-0"
                      />
                      <span>
                        <span className="font-bold text-sky-700">{cadet.rank}</span>{' '}
                        {cadet.first_name} {cadet.last_name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{cadet.instrument}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Uploading...' : 'Save & Assign Part'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
