import { useEffect, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import { saveToDrive } from '../utils/googleDocs';

interface Props {
  html: string;
  filename: string;
  blob: Blob;
  onClose: () => void;
}

export function DocumentViewer({ html, filename, blob, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [showBanner, setShowBanner] = useState(false);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleDownload() {
    saveAs(blob, filename);
  }

  function handlePrint() {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <title>${filename}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 48px; color: #1a1a1a; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: 600; }
        h1 { font-size: 18px; margin: 20px 0 10px; }
        h2 { font-size: 15px; margin: 16px 0 8px; }
        p { margin: 6px 0; font-size: 13px; line-height: 1.5; }
      </style>
    </head><body>${html}</body></html>`);
    win.document.close();
    win.print();
  }

  function handleSaveToDrive() {
    saveToDrive(blob, filename);
    setShowBanner(true);
    // Auto-hide banner after 12 seconds
    setTimeout(() => setShowBanner(false), 12000);
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-6 py-3 shrink-0"
        style={{ background: '#fff', borderBottom: '1px solid #dadce0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
      >
        <span className="flex-1 text-base font-medium text-gray-800 truncate">📄 {filename}</span>
        <button
          onClick={handleDownload}
          className="btn-secondary text-sm py-1.5 px-3"
        >
          ⬇ Download .docx
        </button>
        <button
          onClick={handlePrint}
          className="btn-secondary text-sm py-1.5 px-3"
        >
          🖨 Print
        </button>
        <button
          onClick={handleSaveToDrive}
          className="btn-primary text-sm py-1.5 px-3"
          style={{ background: '#1a73e8', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.28 3L1 12.5 6.28 22h11.44L23 12.5 17.72 3H6.28zm5.72 15.5L5.5 9h13L12 18.5z"/>
          </svg>
          Save to Drive
        </button>
        <button
          onClick={onClose}
          className="ml-2 text-gray-500 hover:text-gray-800 text-xl font-bold leading-none"
          title="Close"
        >
          ×
        </button>
      </div>

      {/* Instruction banner — shown after Save to Drive is clicked */}
      {showBanner && (
        <div
          style={{
            background: '#e8f0fe',
            borderBottom: '1px solid #c5d8fb',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 13,
            color: '#1a56db',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <span>
            <strong>Your file has been downloaded</strong> and your Drive folder has opened in a new tab.
            Drag <strong>{filename}</strong> from your Downloads into the folder tab to save it.
          </span>
          <button
            onClick={() => setShowBanner(false)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#1a56db', fontSize: 18, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Document area */}
      <div className="flex-1 overflow-y-auto" style={{ background: '#f0f4f8' }}>
        <div style={{ maxWidth: 860, margin: '32px auto 64px', padding: '0 16px' }}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #dadce0',
              borderRadius: 2,
              padding: '72px 96px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              minHeight: 1056,
              fontFamily: 'Arial, sans-serif',
              fontSize: 13,
              lineHeight: 1.6,
              color: '#3c4043',
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
