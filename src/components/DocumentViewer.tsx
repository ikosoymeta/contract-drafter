import { useEffect, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import { uploadToGoogleDriveViaScript, saveToDriveFallback } from '../utils/googleDocs';

interface Props {
  html: string;
  filename: string;
  blob: Blob;
  onClose: () => void;
}

type DriveState = 'idle' | 'uploading' | 'success' | 'fallback' | 'error';

export function DocumentViewer({ html, filename, blob, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [driveState, setDriveState] = useState<DriveState>('idle');
  const [driveUrl, setDriveUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

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

  async function handleSaveToDrive() {
    setDriveState('uploading');
    setErrorMsg('');
    try {
      const url = await uploadToGoogleDriveViaScript(blob, filename);
      setDriveUrl(url);
      setDriveState('success');
      // Auto-open the Google Doc
      window.open(url, '_blank');
    } catch (err) {
      console.error('Apps Script upload failed:', err);
      // Fallback: download + open folder
      saveToDriveFallback(blob, filename);
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setDriveState('fallback');
    }
  }

  const saveBtnLabel =
    driveState === 'uploading'
      ? 'Uploading…'
      : driveState === 'success'
      ? '✓ Saved to Drive'
      : 'Save to Drive';

  const saveBtnDisabled = driveState === 'uploading' || driveState === 'success';

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
          disabled={saveBtnDisabled}
          className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: driveState === 'success' ? '#1e8e3e' : '#1a73e8' }}
        >
          {driveState === 'uploading' ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.28 3L1 12.5 6.28 22h11.44L23 12.5 17.72 3H6.28zm5.72 15.5L5.5 9h13L12 18.5z"/>
            </svg>
          )}
          {saveBtnLabel}
        </button>
        <button
          onClick={onClose}
          className="ml-2 text-gray-500 hover:text-gray-800 text-xl font-bold leading-none"
          title="Close"
        >
          ×
        </button>
      </div>

      {/* Success banner */}
      {driveState === 'success' && driveUrl && (
        <div style={{
          background: '#e6f4ea', borderBottom: '1px solid #b7dfbf',
          padding: '10px 24px', display: 'flex', alignItems: 'center',
          gap: 12, fontSize: 13, color: '#1e8e3e',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z"/>
          </svg>
          <span>
            <strong>Saved to Google Drive!</strong> Your document is ready.{' '}
            <a href={driveUrl} target="_blank" rel="noopener noreferrer"
              style={{ color: '#1a73e8', textDecoration: 'underline', fontWeight: 600 }}>
              Open in Google Docs →
            </a>
          </span>
          <button onClick={() => setDriveState('idle')}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#1e8e3e', fontSize: 18, lineHeight: 1 }}>
            ×
          </button>
        </div>
      )}

      {/* Fallback banner — shown when Apps Script fails */}
      {driveState === 'fallback' && (
        <div style={{
          background: '#fef9e7', borderBottom: '1px solid #f9e4a0',
          padding: '10px 24px', display: 'flex', alignItems: 'center',
          gap: 12, fontSize: 13, color: '#b06000',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>
            <strong>Automatic upload failed</strong> — file downloaded instead.
            Drag <strong>{filename}</strong> into the Drive folder that just opened.
            {errorMsg && <span style={{ display: 'block', fontSize: 11, opacity: 0.7, marginTop: 2 }}>{errorMsg}</span>}
          </span>
          <button onClick={() => setDriveState('idle')}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#b06000', fontSize: 18, lineHeight: 1 }}>
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
