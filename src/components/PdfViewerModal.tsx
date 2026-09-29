import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, FileText, Music, Shield, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  composer: string;
  instrumentPart: string;
  fileUrl: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  composer,
  instrumentPart,
  fileUrl,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  if (!isOpen) return null;

  const isImage = fileUrl.startsWith('data:image/') || /\.(png|jpe?g|webp|gif|svg)($|\?)/i.test(fileUrl);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl h-[88vh] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 shrink-0">
              <Music className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 truncate">{title}</h3>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-lg">
                  {instrumentPart}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">Composer: {composer}</p>
            </div>
          </div>

          {/* Action controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-mono tabular-nums text-slate-600">{zoom}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleRotate}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                title="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <a
              href={fileUrl}
              download={`${title.replace(/\s+/g, '_')}_${instrumentPart.replace(/\s+/g, '_')}.pdf`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Music Display Viewport */}
        <div className="flex-1 bg-slate-50 p-6 overflow-auto flex items-center justify-center">
          <div
            className="transition-transform duration-200 origin-center bg-white text-slate-900 shadow-lg rounded-xl p-8 max-w-3xl w-full min-h-[550px] border border-slate-200"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            }}
          >
            {/* Sheet Music Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center relative">
              <div className="absolute left-0 top-0 text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">888 Avenger RCACS Band</span>
                <p className="text-[9px] text-slate-400 font-mono">Vancouver, BC</p>
              </div>
              <div className="absolute right-0 top-0 text-right">
                <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-lg">
                  {instrumentPart}
                </span>
              </div>
              <h2 className="text-2xl font-serif font-black tracking-wide uppercase pt-6 text-slate-950">
                {title}
              </h2>
              <p className="text-xs italic text-slate-600 mt-1">
                Composed / Arranged by {composer}
              </p>
            </div>

            {/* Embedded score preview (Image or PDF) */}
            <div className="space-y-6 py-2">
              {isImage ? (
                <div className="w-full border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col items-center justify-center p-4">
                  <img
                    src={fileUrl}
                    alt={`${title} - ${instrumentPart}`}
                    className="max-w-full max-h-[500px] object-contain rounded-lg shadow-sm border border-slate-200"
                  />
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={fileUrl}
                      download={`${title}_${instrumentPart}.png`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Score Image
                    </a>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-sky-500" />
                      Open Full Size
                    </a>
                  </div>
                </div>
              ) : (
                <div className="h-96 w-full border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative flex flex-col items-center justify-center text-center p-6">
                  <iframe
                    src={fileUrl}
                    title={`${title} - ${instrumentPart}`}
                    className="w-full h-full border-0 absolute inset-0"
                  />
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-white/40 p-4">
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-md max-w-md text-center pointer-events-auto">
                      <FileText className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-800">{instrumentPart}</p>
                      <p className="text-xs text-slate-500 mt-1 mb-3">
                        888 Avenger Band Secure Locker. You can view or download the complete score PDF.
                      </p>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Open Full Document
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-4 border-t border-slate-100">
                <span>Property of 888 Avenger Royal Canadian Air Cadet Squadron Band</span>
                <span className="font-mono">Cadet Use Only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sky-600" />
            Cadet Authorized Access · Row-Level Security Protected
          </span>
          <span className="text-slate-400 font-mono text-[11px]">888-AVENGER-BAND</span>
        </div>
      </div>
    </div>
  );
};
