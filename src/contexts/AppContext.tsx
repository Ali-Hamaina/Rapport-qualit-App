import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, Inspection } from '../types';
import { useToast } from '../hooks/useToast';
import { mockInspections } from '../data/mockData';
import * as api from '../api';

const STORAGE_KEY = 'citrusqc_inspections';

interface AppContextType {
  currentView: View;
  setCurrentView: (view: View) => void;
  selectedInspectionId: string | null;
  setSelectedInspectionId: (id: string | null) => void;
  inspections: Inspection[];
  addInspection: (inspection: Inspection) => void;
  updateInspection: (id: string, updates: Partial<Inspection>) => void;
  deleteInspection: (id: string) => Promise<void>;
  toast: ReturnType<typeof useToast>;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);

  // localStorage-backed state with lazy initializer
  const [inspections, setInspections] = useState<Inspection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : mockInspections;
    } catch {
      return mockInspections;
    }
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const toast = useToast();

  // Load from server on mount, fallback to localStorage
  useEffect(() => {
    api.fetchInspections()
      .then((data: Inspection[]) => {
        if (data && data.length > 0) {
          setInspections(data);
        }
      })
      .catch(() => {
        // Server not available — keep localStorage data
      });
  }, []);

  // Auto-save to localStorage whenever inspections change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inspections));
    } catch {
      // Storage full or unavailable — silently ignore
    }
  }, [inspections]);

  const addInspection = (inspection: Inspection) => {
    setInspections(prev => [inspection, ...prev]);
    api.saveInspection(inspection as unknown as Record<string, unknown>).catch(() => {});
    toast.success('Inspection créée avec succès!');
  };

  const updateInspection = (id: string, updates: Partial<Inspection>) => {
    setInspections(prev =>
      prev.map(ins => (ins.id === id ? { ...ins, ...updates } : ins))
    );
    // Sync full updated object to server
    setInspections(prev => {
      const updated = prev.find(i => i.id === id);
      if (updated) {
        api.saveInspection(updated as unknown as Record<string, unknown>).catch(() => {});
      }
      return prev;
    });
    toast.success('Inspection mise à jour avec succès!');
  };

  const deleteInspection = async (id: string) => {
    try {
      // Delete photos first
      await api.deletePhotos(id);
    } catch (error) {
      // Continue even if photo deletion fails
      console.warn('Failed to delete photos:', error);
    }
    
    // Then delete the inspection
    setInspections(prev => prev.filter(inspection => inspection.id !== id));
    api.deleteInspection(id).catch(() => {});
    toast.success('Inspection supprimée avec succès!');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const value: AppContextType = {
    currentView,
    setCurrentView,
    selectedInspectionId,
    setSelectedInspectionId,
    inspections,
    addInspection,
    updateInspection,
    deleteInspection,
    toast,
    sidebarCollapsed,
    toggleSidebar,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
