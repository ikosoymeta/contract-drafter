import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { randomUUID } from 'crypto';

const app = express();
const PORT = 3001;

// Public base URL for file serving — Google Docs needs a publicly reachable URL.
// Set PUBLIC_BASE_URL env var in production. Falls back to localhost for local download.
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;

// Allow all origins so Google's servers can fetch the file
app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory file store
const fileStore = new Map();

// Cleanup files older than 10 minutes
const EXPIRY_MS = 10 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of fileStore.entries()) {
    if (now - entry.createdAt > EXPIRY_MS) {
      fileStore.delete(id);
      console.log(`Cleaned up expired file: ${id}`);
    }
  }
}, 60_000);

// Multer config: store in memory
const upload = multer({ storage: multer.memoryStorage() });

// Upload endpoint
app.post('/api/files/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const id = randomUUID();
  fileStore.set(id, {
    buffer: req.file.buffer,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    createdAt: Date.now(),
  });

  // Return the public URL so Google Docs can fetch it
  const publicUrl = `${PUBLIC_BASE_URL}/api/files/${id}`;
  console.log(`File uploaded: ${req.file.originalname} -> ${publicUrl}`);
  res.json({ id, url: publicUrl });
});

// Serve file endpoint — must be publicly reachable for Google Docs import
app.get('/api/files/:id', (req, res) => {
  const entry = fileStore.get(req.params.id);
  if (!entry) {
    return res.status(404).json({ error: 'File not found or expired' });
  }

  res.set({
    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'Content-Disposition': `inline; filename="${entry.originalName}"`,
    'Content-Length': entry.buffer.length,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
  });
  res.send(entry.buffer);
});

app.listen(PORT, () => {
  console.log(`Contract Drafter API server running on http://localhost:${PORT}`);
  console.log(`Public base URL: ${PUBLIC_BASE_URL}`);
});
