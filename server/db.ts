import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR, 'data.db')
  : path.resolve(__dirname, '..', 'data.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Migrate: add batchNumber column if missing
try {
  db.exec(`ALTER TABLE inspections ADD COLUMN batchNumber TEXT DEFAULT ''`);
} catch (_) {
  // Column already exists
}

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS inspections (
    id TEXT PRIMARY KEY,
    variety TEXT NOT NULL,
    commodity TEXT NOT NULL,
    grower TEXT NOT NULL,
    inspector TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    image TEXT DEFAULT '',
    qualityScore INTEGER,
    sampleSize INTEGER,
    lotNumber TEXT DEFAULT '',
    batchNumber TEXT DEFAULT '',
    facility TEXT DEFAULT '',
    controlPointName TEXT DEFAULT '',
    packDate TEXT DEFAULT '',
    inspectionTime TEXT DEFAULT '',
    sampleTime TEXT DEFAULT '',
    inspectionSampleSize INTEGER,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS serious_defects (
    id TEXT NOT NULL,
    inspectionId TEXT NOT NULL,
    name TEXT NOT NULL,
    units INTEGER DEFAULT 0,
    percentage REAL DEFAULT 0,
    PRIMARY KEY (id, inspectionId),
    FOREIGN KEY (inspectionId) REFERENCES inspections(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS non_serious_defects (
    id TEXT NOT NULL,
    inspectionId TEXT NOT NULL,
    name TEXT NOT NULL,
    units INTEGER DEFAULT 0,
    percentage REAL DEFAULT 0,
    PRIMARY KEY (id, inspectionId),
    FOREIGN KEY (inspectionId) REFERENCES inspections(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS samples (
    id TEXT NOT NULL,
    inspectionId TEXT NOT NULL,
    name TEXT NOT NULL,
    boxWeight TEXT DEFAULT '',
    brix TEXT DEFAULT '',
    ringSizes TEXT DEFAULT '',
    comments TEXT DEFAULT '',
    PRIMARY KEY (id, inspectionId),
    FOREIGN KEY (inspectionId) REFERENCES inspections(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inspectionId TEXT NOT NULL,
    filePath TEXT NOT NULL,
    originalName TEXT DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (inspectionId) REFERENCES inspections(id) ON DELETE CASCADE
  );
`);

// ── Prepared statements ──

const insertInspection = db.prepare(`
  INSERT INTO inspections (
    id, variety, commodity, grower, inspector, date, status, image,
    qualityScore, sampleSize, lotNumber, batchNumber, facility, controlPointName,
    packDate, inspectionTime, sampleTime, inspectionSampleSize, updatedAt
  ) VALUES (
    @id, @variety, @commodity, @grower, @inspector, @date, @status, @image,
    @qualityScore, @sampleSize, @lotNumber, @batchNumber, @facility, @controlPointName,
    @packDate, @inspectionTime, @sampleTime, @inspectionSampleSize, datetime('now')
  )
  ON CONFLICT(id) DO UPDATE SET
    variety = excluded.variety,
    commodity = excluded.commodity,
    grower = excluded.grower,
    inspector = excluded.inspector,
    date = excluded.date,
    status = excluded.status,
    image = excluded.image,
    qualityScore = excluded.qualityScore,
    sampleSize = excluded.sampleSize,
    lotNumber = excluded.lotNumber,
    batchNumber = excluded.batchNumber,
    facility = excluded.facility,
    controlPointName = excluded.controlPointName,
    packDate = excluded.packDate,
    inspectionTime = excluded.inspectionTime,
    sampleTime = excluded.sampleTime,
    inspectionSampleSize = excluded.inspectionSampleSize,
    updatedAt = datetime('now')
`);

const insertSeriousDefect = db.prepare(`
  INSERT OR REPLACE INTO serious_defects (id, inspectionId, name, units, percentage)
  VALUES (@id, @inspectionId, @name, @units, @percentage)
`);

const insertNonSeriousDefect = db.prepare(`
  INSERT OR REPLACE INTO non_serious_defects (id, inspectionId, name, units, percentage)
  VALUES (@id, @inspectionId, @name, @units, @percentage)
`);

const insertSample = db.prepare(`
  INSERT OR REPLACE INTO samples (id, inspectionId, name, boxWeight, brix, ringSizes, comments)
  VALUES (@id, @inspectionId, @name, @boxWeight, @brix, @ringSizes, @comments)
`);

const insertPhoto = db.prepare(`
  INSERT INTO photos (inspectionId, filePath, originalName) VALUES (@inspectionId, @filePath, @originalName)
`);

const deleteSeriousDefects = db.prepare('DELETE FROM serious_defects WHERE inspectionId = ?');
const deleteNonSeriousDefects = db.prepare('DELETE FROM non_serious_defects WHERE inspectionId = ?');
const deleteSamples = db.prepare('DELETE FROM samples WHERE inspectionId = ?');
const deletePhotos = db.prepare('DELETE FROM photos WHERE inspectionId = ?');
const deleteInspection = db.prepare('DELETE FROM inspections WHERE id = ?');

const getAllInspections = db.prepare('SELECT * FROM inspections ORDER BY updatedAt DESC');
const getInspectionById = db.prepare('SELECT * FROM inspections WHERE id = ?');
const getSeriousDefects = db.prepare('SELECT * FROM serious_defects WHERE inspectionId = ?');
const getNonSeriousDefects = db.prepare('SELECT * FROM non_serious_defects WHERE inspectionId = ?');
const getSamples = db.prepare('SELECT * FROM samples WHERE inspectionId = ?');
const getPhotos = db.prepare('SELECT filePath FROM photos WHERE inspectionId = ?');

// ── Public API ──

export interface InspectionRow {
  id: string;
  variety: string;
  commodity: string;
  grower: string;
  inspector: string;
  date: string;
  status: string;
  image: string;
  qualityScore: number | null;
  sampleSize: number | null;
  lotNumber: string;
  batchNumber: string;
  facility: string;
  controlPointName: string;
  packDate: string;
  inspectionTime: string;
  sampleTime: string;
  inspectionSampleSize: number | null;
}

function buildFullInspection(row: InspectionRow) {
  const id = row.id;
  return {
    ...row,
    qualityScore: row.qualityScore ?? undefined,
    sampleSize: row.sampleSize ?? undefined,
    inspectionSampleSize: row.inspectionSampleSize ?? undefined,
    seriousDefects: (getSeriousDefects.all(id) as any[]).map(d => ({
      id: d.id,
      name: d.name,
      units: d.units,
      percentage: d.percentage,
    })),
    nonSeriousDefects: (getNonSeriousDefects.all(id) as any[]).map(d => ({
      id: d.id,
      name: d.name,
      units: d.units,
      percentage: d.percentage,
    })),
    samples: (getSamples.all(id) as any[]).map(s => ({
      id: s.id,
      name: s.name,
      boxWeight: s.boxWeight,
      brix: s.brix,
      ringSizes: s.ringSizes,
      comments: s.comments,
    })),
    photos: (getPhotos.all(id) as any[]).map(p => p.filePath),
  };
}

export function dbGetAllInspections() {
  const rows = getAllInspections.all() as InspectionRow[];
  return rows.map(buildFullInspection);
}

export function dbGetInspection(id: string) {
  const row = getInspectionById.get(id) as InspectionRow | undefined;
  if (!row) return null;
  return buildFullInspection(row);
}

export const dbSaveInspection = db.transaction((data: any) => {
  insertInspection.run({
    id: data.id,
    variety: data.variety || '',
    commodity: data.commodity || '',
    grower: data.grower || '',
    inspector: data.inspector || '',
    date: data.date || '',
    status: data.status || 'Accepté',
    image: data.image || '',
    qualityScore: data.qualityScore ?? null,
    sampleSize: data.sampleSize ?? null,
    lotNumber: data.lotNumber || '',
    batchNumber: data.batchNumber || '',
    facility: data.facility || '',
    controlPointName: data.controlPointName || '',
    packDate: data.packDate || '',
    inspectionTime: data.inspectionTime || '',
    sampleTime: data.sampleTime || '',
    inspectionSampleSize: data.inspectionSampleSize ?? null,
  });

  // Clear and re-insert related data
  deleteSeriousDefects.run(data.id);
  deleteNonSeriousDefects.run(data.id);
  deleteSamples.run(data.id);

  if (data.seriousDefects) {
    for (const d of data.seriousDefects) {
      insertSeriousDefect.run({ ...d, inspectionId: data.id });
    }
  }
  if (data.nonSeriousDefects) {
    for (const d of data.nonSeriousDefects) {
      insertNonSeriousDefect.run({ ...d, inspectionId: data.id });
    }
  }
  if (data.samples) {
    for (const s of data.samples) {
      insertSample.run({ ...s, inspectionId: data.id });
    }
  }
  // Sync photos if provided in data (covers base64 fallback and client-side photos)
  if (data.photos && Array.isArray(data.photos)) {
    const existingPhotos = (getPhotos.all(data.id) as any[]).map(p => p.filePath);
    for (const photo of data.photos) {
      if (!existingPhotos.includes(photo)) {
        insertPhoto.run({ inspectionId: data.id, filePath: photo, originalName: '' });
      }
    }
  }
});

export function dbDeleteInspection(id: string) {
  deleteInspection.run(id);
}

export function dbAddPhoto(inspectionId: string, filePath: string, originalName: string) {
  insertPhoto.run({ inspectionId, filePath, originalName });
}

export function dbDeleteInspectionPhotos(inspectionId: string) {
  deletePhotos.run(inspectionId);
}

export function dbGetPhotos(inspectionId: string): string[] {
  return (getPhotos.all(inspectionId) as any[]).map(p => p.filePath);
}

export default db;
