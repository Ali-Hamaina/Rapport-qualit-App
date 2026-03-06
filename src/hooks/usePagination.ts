import { useState, useEffect } from 'react';
import { PaginationState } from '../types';
import { getPaginationInfo } from '../lib/utils';
import { ITEMS_PER_PAGE } from '../constants';

/**
 * Custom hook for pagination logic
 */
export function usePagination<T>(
  items: T[],
  initialItemsPerPage = ITEMS_PER_PAGE
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Reset to first page when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  const paginationInfo = getPaginationInfo(items.length, currentPage, itemsPerPage);
  const paginatedItems = items.slice(paginationInfo.startIndex, paginationInfo.endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (paginationInfo.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (paginationInfo.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const changeItemsPerPage = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return {
    paginatedItems,
    currentPage,
    itemsPerPage,
    totalPages: paginationInfo.totalPages,
    hasNextPage: paginationInfo.hasNextPage,
    hasPrevPage: paginationInfo.hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
    changeItemsPerPage,
    startIndex: paginationInfo.startIndex,
    endIndex: paginationInfo.endIndex,
    totalItems: items.length,
  };
}
