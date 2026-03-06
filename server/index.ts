import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  dbGetAllInspections,
  dbGetInspection,
  dbSaveInspection,
  dbDeleteInspection,
  dbAddPhoto,
  dbDeleteInspectionPhotos,
  dbGetPhotos,
} from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3011', 10);

// Ensure uploads directory exists
const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve uploaded images as static files
app.use('/uploads', express.static(UPLOADS_DIR));

// Multer storage config — saves files to public/uploads with unique names
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50);
    const uniqueName = `${Date.now()}_${safeName}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max per file
  fileFilter: (_req, file, cb) => {
    const allowed = /^image\/(jpeg|jpg|png|gif|webp|bmp|svg\+xml)$/;
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// ── ROUTES ──

// GET all inspections
app.get('/api/inspections', (_req, res) => {
  try {
    const inspections = dbGetAllInspections();
    res.json(inspections);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET single inspection
app.get('/api/inspections/:id', (req, res) => {
  try {
    const inspection = dbGetInspection(req.params.id);
    if (!inspection) return res.status(404).json({ error: 'Not found' });
    res.json(inspection);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST create / PUT update inspection
app.post('/api/inspections', (req, res) => {
  try {
    dbSaveInspection(req.body);
    const saved = dbGetInspection(req.body.id);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/inspections/:id', (req, res) => {
  try {
    dbSaveInspection({ ...req.body, id: req.params.id });
    const saved = dbGetInspection(req.params.id);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE inspection (also deletes photos from disk)
app.delete('/api/inspections/:id', (req, res) => {
  try {
    const photos = dbGetPhotos(req.params.id);
    // Remove photo files from disk
    for (const photoPath of photos) {
      const fullPath = path.join(UPLOADS_DIR, path.basename(photoPath));
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    dbDeleteInspection(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST upload photos for an inspection
app.post('/api/inspections/:id/photos', upload.array('photos', 20), (req, res) => {
  try {
    const inspectionId = req.params.id;
    const files = req.files as Express.Multer.File[];
    const paths: string[] = [];

    for (const file of files) {
      const relativePath = `/uploads/${file.filename}`;
      dbAddPhoto(inspectionId, relativePath, file.originalname);
      paths.push(relativePath);
    }

    res.json({ photos: paths });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE all photos for an inspection
app.delete('/api/inspections/:id/photos', (req, res) => {
  try {
    const photos = dbGetPhotos(req.params.id);
    for (const photoPath of photos) {
      const fullPath = path.join(UPLOADS_DIR, path.basename(photoPath));
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    dbDeleteInspectionPhotos(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// In production, serve the Vite frontend build
const distPath = path.resolve(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback: serve index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ API server running on http://localhost:${PORT}`);
  console.log(`  Uploads dir: ${UPLOADS_DIR}`);
});
