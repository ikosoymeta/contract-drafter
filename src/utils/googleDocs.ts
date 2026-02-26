import mammoth from 'mammoth';
import { saveAs } from 'file-saver';

/** The specific Google Drive folder where contracts should be stored */
export const GOOGLE_DRIVE_FOLDER_ID = '1dcmur1QVcbaPAR0CneVo6DlaA6bq_M6Y';
export const GOOGLE_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${GOOGLE_DRIVE_FOLDER_ID}`;

/** Google Apps Script Web App endpoint */
const GAS_ENDPOINT =
  'https://script.google.com/a/macros/meta.com/s/AKfycbwL7ClMd9bI6QZyVOuBBAAWAPvwNi10fcBPBGUwgoi5lw2Ge3QcFOm935NePXlGgcvDEA/exec';

/**
 * Convert a DOCX blob to an HTML string using mammoth.
 * Used to render a preview in the DocumentViewer component.
 */
export async function convertDocxToHtml(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value;
}

/**
 * Upload a DOCX blob to Google Drive via the Google Apps Script Web App.
 * The script receives a base64-encoded JSON payload and returns a Google Docs URL.
 *
 * Expected Apps Script doPost(e) response:
 *   { success: true, url: "https://docs.google.com/document/d/FILE_ID/edit" }
 *   or on error:
 *   { success: false, error: "message" }
 */
export async function uploadToGoogleDriveViaScript(
  blob: Blob,
  filename: string,
): Promise<string> {
  // Convert blob to base64
  const arrayBuffer = await blob.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  const base64 = btoa(binary);

  const payload = {
    filename,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    data: base64,
    folderId: GOOGLE_DRIVE_FOLDER_ID,
  };

  const response = await fetch(GAS_ENDPOINT, {
    method: 'POST',
    // Apps Script Web Apps require text/plain or no content-type for JSON payloads
    // when accessed cross-origin (no CORS preflight issues with text/plain)
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Apps Script returned HTTP ${response.status}`);
  }

  const text = await response.text();
  let result: { success: boolean; url?: string; fileUrl?: string; editUrl?: string; error?: string };
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(`Apps Script returned unexpected response: ${text.slice(0, 200)}`);
  }

  if (!result.success) {
    throw new Error(result.error ?? 'Apps Script upload failed');
  }

  // Support multiple common response field names
  const url = result.url ?? result.fileUrl ?? result.editUrl;
  if (!url) {
    throw new Error('Apps Script did not return a file URL');
  }

  return url;
}

/**
 * Fallback: download the DOCX locally and open the Drive folder.
 * Used when the Apps Script upload fails.
 */
export function saveToDriveFallback(blob: Blob, filename: string): void {
  saveAs(blob, filename);
  setTimeout(() => {
    window.open(GOOGLE_DRIVE_FOLDER_URL, '_blank');
  }, 400);
}

export function openDriveFolder(): void {
  window.open(GOOGLE_DRIVE_FOLDER_URL, '_blank');
}
