// Application Constants
export const APP_NAME = 'CitrusQC Pro';
export const STATION_ID = 'Station Alpha-01';

// Status Types
export const INSPECTION_STATUS = {
  ACCEPTED: 'Accepté',
  WARNING: 'Avertissement',
  REJECTED: 'Rejeté',
} as const;

export const DEFECT_STATUS = {
  PASSED: 'Passé',
  WARNING: 'Avertissement',
  FAILED: 'Échec',
} as const;

// Quality Thresholds
export const QUALITY_THRESHOLDS = {
  CRITICAL_DEFECTS_MAX: 5,
  SERIOUS_DEFECTS_MAX: 10,
  MINOR_DEFECTS_MAX: 15,
  MIN_QUALITY_SCORE: 60,
};

// Sample Sizes
export const DEFAULT_SAMPLE_SIZE = 100;

// Pagination
export const ITEMS_PER_PAGE = 9;

// Date Formats
export const DATE_FORMAT = 'DD MMM YYYY';
export const DATETIME_FORMAT = 'DD MMM YYYY HH:mm';

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  INSPECTIONS: '/api/inspections',
  GROWERS: '/api/growers',
  REPORTS: '/api/reports',
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#f49d25',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#3b82f6',
};

// Varieties
export const CITRUS_VARIETIES = [
  'Valencia Late',
  'Washington Navel',
  'Eureka Standard',
  'Meyer Lemon',
  'Ruby Red Grapefruit',
  'Clementine',
] as const;

// Commodities
export const CITRUS_COMMODITIES = [
  'Orange Valencia',
  'Orange Navel',
  'Citron Eureka',
  'Citron Meyer',
  'Pamplemousse',
  'Mandarine',
] as const;
