import mammoth from 'mammoth';

export const GOOGLE_DRIVE_FOLDER = 'https://drive.google.com/drive/u/0/folders/0AFszIqpbNJEXUk9PVA';

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
 * Keep the local server upload as a fallback for other use cases.
 */
export async function uploadToServer(blob: Blob, filename: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', blob, filename);

  const res = await fetch('/api/files/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.statusText}`);
  }

  const data = await res.json();
  return data.url as string;
}

export function openDriveFolder() {
  window.open(GOOGLE_DRIVE_FOLDER, '_blank');
}
