import mammoth from 'mammoth';
import { saveAs } from 'file-saver';

/** The specific Google Drive folder where contracts should be stored */
export const GOOGLE_DRIVE_FOLDER_ID = '1dcmur1QVcbaPAR0CneVo6DlaA6bq_M6Y';
export const GOOGLE_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${GOOGLE_DRIVE_FOLDER_ID}`;

/**
 * Convert a DOCX blob to an HTML string using mammoth.
 * The HTML can then be rendered in a DocumentViewer component.
 */
export async function convertDocxToHtml(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value;
}

/**
 * Save to Drive flow (no OAuth required):
 * 1. Downloads the DOCX file to the user's computer
 * 2. Opens the specific Drive folder in a new tab
 * The user can then drag the downloaded file into the folder.
 */
export function saveToDrive(blob: Blob, filename: string): void {
  // Step 1: trigger download
  saveAs(blob, filename);
  // Step 2: open the Drive folder (slight delay so download starts first)
  setTimeout(() => {
    window.open(GOOGLE_DRIVE_FOLDER_URL, '_blank');
  }, 400);
}

export function openDriveFolder(): void {
  window.open(GOOGLE_DRIVE_FOLDER_URL, '_blank');
}
