import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/lib/authContext';
import { usePermission } from '@/hooks/usePermission';
import { toast } from '@/lib/toast';

/**
 * usePageData - Hook for initializing page data with auth and RBAC checks
 * 
 * Usage:
 * const { isLoading, error, hasAccess } = usePageData('view:bookings');
 */
export const usePageData = (requiredPermission: string) => {
  const { propertyId, user } = useAuth();
  const { hasPermission } = usePermission();
  const { initializeData, isLoading, isInitialized, error } = useAppStore();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      try {
        // Check permission first
        if (!hasPermission(requiredPermission)) {
          toast.error('You do not have permission to access this page');
          setHasAccess(false);
          return;
        }

        setHasAccess(true);

        // Initialize store data if not already done
        if (!isInitialized && propertyId && user) {
          await initializeData(propertyId);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load page data';
        toast.error(errorMsg);
        console.error('Page initialization error:', err);
      }
    };

    initPage();
  }, [propertyId, user, hasPermission, requiredPermission, initializeData, isInitialized]);

  return {
    isLoading,
    error,
    hasAccess,
    propertyId,
    user,
    isReady: !isLoading && hasAccess,
  };
};

/**
 * usePaginatedData - Hook for handling paginated lists
 * 
 * Usage:
 * const { items, page, totalPages, goToPage, goNext, goPrev } = usePaginatedData(bookings, 10);
 */
export const usePaginatedData = <T extends any>(items: T[], pageSize: number = 10) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(items.length / pageSize);
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageItems = items.slice(startIdx, endIdx);

  return {
    items: pageItems,
    page,
    totalPages,
    totalItems: items.length,
    goToPage: (p: number) => setPage(Math.max(1, Math.min(p, totalPages))),
    goNext: () => setPage((p) => Math.min(p + 1, totalPages)),
    goPrev: () => setPage((p) => Math.max(p - 1, 1)),
    isFirstPage: page === 1,
    isLastPage: page === totalPages,
  };
};

/**
 * useFilteredData - Hook for filtering data by multiple criteria
 * 
 * Usage:
 * const { filtered, setFilters } = useFilteredData(bookings, ['status', 'roomType']);
 */
export const useFilteredData = <T extends Record<string, any>>(
  items: T[],
  filterKeys: (keyof T)[]
) => {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = items.filter((item) =>
    filterKeys.every((key) => {
      const filterValue = filters[String(key)];
      if (!filterValue) return true;
      const itemValue = String(item[key]);
      return itemValue.toLowerCase().includes(filterValue.toLowerCase());
    })
  );

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => setFilters({});

  return {
    filtered,
    filters,
    setFilter,
    setFilters,
    clearFilters,
    hasActiveFilters: Object.values(filters).some((v) => v),
  };
};

/**
 * useSortedData - Hook for sorting data
 * 
 * Usage:
 * const { sorted, sort, sortKey, sortDir } = useSortedData(bookings, 'checkIn');
 */
export type SortDirection = 'asc' | 'desc';

export const useSortedData = <T extends Record<string, any>>(
  items: T[],
  defaultSort?: keyof T
) => {
  const [sortKey, setSortKey] = useState<keyof T | null>(defaultSort || null);
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const sorted = [...items].sort((a, b) => {
    if (!sortKey) return 0;

    const aVal = a[sortKey];
    const bVal = b[sortKey];

    // Handle null/undefined
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return sortDir === 'asc' ? 1 : -1;
    if (bVal == null) return sortDir === 'asc' ? -1 : 1;

    // String comparison
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    }

    // Number comparison
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Date comparison
    const aDate = new Date(aVal);
    const bDate = new Date(bVal);
    if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
      return sortDir === 'asc'
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }

    return 0;
  });

  const sort = (key: keyof T) => {
    if (sortKey === key) {
      // Toggle direction if same column clicked
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, sort ascending
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return {
    sorted,
    sort,
    sortKey,
    sortDir,
  };
};
