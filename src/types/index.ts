import React from 'react';
import { INSPECTION_STATUS, DEFECT_STATUS } from '../constants';

export type View = 'dashboard' | 'create' | 'edit' | 'inspections' | 'view' | 'details' | 'reports' | 'growers' | 'inventory' | 'print';

export type InspectionStatus = typeof INSPECTION_STATUS[keyof typeof INSPECTION_STATUS];
export type DefectStatus = typeof DEFECT_STATUS[keyof typeof DEFECT_STATUS];

export interface DefectEntry {
  id: string;
  name: string;
  units: number;
  percentage: number;
}

export interface SampleEntry {
  id: string;
  name: string;
  boxWeight: string;
  brix: string;
  ringSizes: string;
  comments: string;
}

export interface Inspection {
  id: string;
  variety: string;
  commodity: string;
  grower: string;
  inspector: string;
  date: string;
  status: InspectionStatus;
  image: string;
  qualityScore?: number;
  sampleSize?: number;
  lotNumber?: string;
  facility?: string;
  // Section 1 extra fields
  controlPointName?: string;
  packDate?: string;
  inspectionTime?: string;
  sampleTime?: string;
  // Section 2 data
  inspectionSampleSize?: number;
  seriousDefects?: DefectEntry[];
  nonSeriousDefects?: DefectEntry[];
  samples?: SampleEntry[];
  photos?: string[];
}

export interface DefectData {
  id: string;
  name: string;
  description: string;
  units: number;
  percentage: number;
  status: DefectStatus;
  category: 'critical' | 'serious' | 'minor';
}

export interface InspectionDetails extends Inspection {
  boxWeight: number;
  brixRate: number;
  ringSize: string;
  defects: DefectData[];
  qualityThresholds: {
    appearance: number;
    waterBalance: number;
    postHarvestDurability: number;
  };
  grade: string;
  confidence: number;
  notes: string;
  images: InspectionImage[];
}

export interface InspectionImage {
  id: string;
  src: string;
  status: 'Passé' | 'Mineur' | 'Grave';
  timestamp: string;
}

export interface StatCard {
  title: string;
  value: string;
  trend: string;
  color: 'primary' | 'emerald' | 'amber' | 'rose';
  icon: React.ReactNode;
}

export interface ChartDataPoint {
  name: string;
  value1: number;
  value2: number;
  label?: string;
}

export interface FilterOptions {
  variety?: string;
  status?: InspectionStatus;
  dateFrom?: string;
  dateTo?: string;
  grower?: string;
  inspector?: string;
}

export interface SortOptions {
  field: keyof Inspection;
  direction: 'asc' | 'desc';
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface FormErrors {
  [key: string]: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
