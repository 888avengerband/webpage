import React, { useCallback, useEffect, useState } from 'react';
import { Download, FileText, Loader2, Pin, PinOff, Plus, RefreshCw, Trash2, UploadCloud } from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';

interface MonthlyRoutineOrder {
  id: string;
  title: string;
  description: string | null;
  document_path: string;
  created_at: string;
  is_pinned: boolean;
}

interface MROSectionProps {
  isAdmin: boolean;
}

const BUCKET = 'mros';

export const MROSection: React.FC<MROSectionProps> = ({ isAdmin }) => {
  const [orders, setOrders] = useState<MonthlyRoutineOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase is not configured. Please contact a band officer.');
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from('monthly_routine_orders')
      .select('id, title, description, document_path, created_at, is_pinned')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    if (queryError) {
      setError(queryError.message);
      setOrders([]);
    } else {
      setError('');
      setOrders((data || []) as MonthlyRoutineOrder[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isAdmin || !file || !title.trim()) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.');
      return;
    }
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }
    setUploading(true);
    setError('');
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: 'application/pdf',
      upsert: false,
    });
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }
    const { error: insertError } = await supabase.from('monthly_routine_orders').insert({
      title: title.trim(),
      description: description.trim() || null,
      document_path: path,
    });
    if (insertError) {
      await supabase.storage.from(BUCKET).remove([path]);
      setError(insertError.message);
      setUploading(false);
      return;
    }
    setTitle('');
    setDescription('');
    setFile(null);
    const input = document.getElementById('mro-pdf-upload') as HTMLInputElement | null;
    if (input) input.value = '';
    await loadOrders();
    setUploading(false);
  };

  const handleDownload = async (order: MonthlyRoutineOrder) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { data, error: urlError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(order.document_path, 60);
    if (urlError || !data?.signedUrl) {
      setError(urlError?.message || 'Could not open this document.');
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTogglePin = async (order: MonthlyRoutineOrder) => {
    if (!isAdmin) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error: updateError } = await supabase
      .from('monthly_routine_orders')
      .update({ is_pinned: !order.is_pinned })
      .eq('id', order.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await loadOrders();
  };

  const handleDelete = async (order: MonthlyRoutineOrder) => {
    if (!isAdmin || !window.confirm(`Delete "${order.title}"? This cannot be undone.`)) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error: rowError } = await supabase.from('monthly_routine_orders').delete().eq('id', order.id);
    if (rowError) {
      setError(rowError.message);
      return;
    }
    const { error: fileError } = await supabase.storage.from(BUCKET).remove([order.document_path]);
    if (fileError) setError(`The document record was deleted, but its stored PDF could not be removed: ${fileError.message}`);
    await loadOrders();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Important Documents</h2>
          <p className="text-xs text-slate-500 mt-1">Documents and resources published by the band.</p>
        </div>
        <button onClick={() => void loadOrders()} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {isAdmin && (
        <form onSubmit={handleUpload} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><UploadCloud className="w-4 h-4 text-sky-600" /> Upload an Important Document</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-slate-700 space-y-1">
              Document title
              <input value={title} onChange={e => setTitle(e.target.value)} required maxLength={120} placeholder="e.g. Uniform Guide or Training Schedule" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-normal focus:outline-none focus:border-sky-500" />
            </label>
            <label className="text-xs font-semibold text-slate-700 space-y-1">
              PDF document
              <input id="mro-pdf-upload" type="file" accept="application/pdf,.pdf" required onChange={e => setFile(e.target.files?.[0] || null)} className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-normal" />
            </label>
          </div>
          <label className="block text-xs font-semibold text-slate-700 space-y-1">
            Description (optional)
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} maxLength={500} placeholder="Optional notes for cadets..." className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-normal focus:outline-none focus:border-sky-500" />
          </label>
          <button type="submit" disabled={uploading || !file || !title.trim()} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Publish Document'}
          </button>
        </form>
      )}

      {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}

      {loading ? (
        <div className="p-10 text-center text-slate-500 text-xs"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading documents...</div>
      ) : orders.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No documents have been published yet</p>
          <p className="text-xs mt-1">Newly uploaded documents will appear here. Pinned documents stay at the top, followed by newest uploads.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-sky-600" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">{order.title}{order.is_pinned && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700"><Pin className="w-3 h-3" /> Pinned</span>}</h3>
                {order.description && <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{order.description}</p>}
                <p className="text-[10px] text-slate-400 mt-1">Published {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && <button onClick={() => void handleTogglePin(order)} title={order.is_pinned ? 'Unpin document' : 'Pin document to top'} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold ${order.is_pinned ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {order.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}{order.is_pinned ? 'Unpin' : 'Pin to top'}
                </button>}
                <button onClick={() => void handleDownload(order)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold">
                  <Download className="w-3.5 h-3.5" /> View / Download
                </button>
                {isAdmin && <button onClick={() => void handleDelete(order)} title="Delete document" className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
