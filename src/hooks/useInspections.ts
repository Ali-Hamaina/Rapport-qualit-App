import { useState, useEffect } from 'react';
import { FilterOptions, Inspection, SortOptions } from '../types';
import { filterBySearch, sortByKey } from '../lib/utils';

/**
 * Custom hook for managing inspections with filters, search, and sorting
 */
export function useInspections(initialInspections: Inspection[]) {
  const [inspections, setInspections] = useState<Inspection[]>(initialInspections);
  const [filteredInspections, setFilteredInspections] = useState<Inspection[]>(initialInspections);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'date',
    direction: 'desc',
  });
  const [loading, setLoading] = useState(false);

  // Sync with external changes (e.g. deletion from context)
  useEffect(() => {
    setInspections(initialInspections);
  }, [initialInspections]);

  // Apply filters, search, and sorting
  useEffect(() => {
    let result = [...inspections];

    // Apply filters
    if (filters.variety) {
      result = result.filter(i => i.variety === filters.variety);
    }
    if (filters.status) {
      result = result.filter(i => i.status === filters.status);
    }
    if (filters.grower) {
      result = result.filter(i => i.grower.toLowerCase().includes(filters.grower!.toLowerCase()));
    }
    if (filters.dateFrom) {
      result = result.filter(i => new Date(i.date) >= new Date(filters.dateFrom!));
    }
    if (filters.dateTo) {
      result = result.filter(i => new Date(i.date) <= new Date(filters.dateTo!));
    }

    // Apply search (includes lot number, id, facility)
    if (searchQuery) {
      result = filterBySearch(result, searchQuery, ['variety', 'commodity', 'grower', 'inspector', 'lotNumber', 'id', 'facility']);
    }

    // Apply sorting
    result = sortByKey(result, sortOptions.field, sortOptions.direction);

    setFilteredInspections(result);
  }, [inspections, filters, searchQuery, sortOptions]);

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const updateSort = (field: keyof Inspection) => {
    setSortOptions(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const addInspection = (inspection: Inspection) => {
    setInspections(prev => [inspection, ...prev]);
  };

  const updateInspection = (id: string, updates: Partial<Inspection>) => {
    setInspections(prev =>
      prev.map(inspection =>
        inspection.id === id ? { ...inspection, ...updates } : inspection
      )
    );
  };

  const deleteInspection = (id: string) => {
    setInspections(prev => prev.filter(inspection => inspection.id !== id));
  };

  return {
    inspections: filteredInspections,
    allInspections: inspections,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    clearFilters,
    sortOptions,
    updateSort,
    loading,
    setLoading,
    addInspection,
    updateInspection,
    deleteInspection,
  };
}
