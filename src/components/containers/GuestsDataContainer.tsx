import React, { type ReactNode } from 'react';
import { useAuth } from '@/lib/authContext';
import { usePermission } from '@/hooks/usePermission';
import { usePageData } from '@/hooks/usePageData';
import { useAppStore } from '@/store/useAppStore';
import { usePaginatedData, useFilteredData, useSortedData } from '@/hooks/usePageData';
import type { Guest } from '@/store/useAppStore';

/**
 * GuestsDataContainer - Specialized container for guest management pages
 * 
 * Provides:
 * - Real guest data from Supabase
 * - RBAC permission checks for viewing/editing guests
 * - Pagination, filtering, and sorting functionality
 */

interface GuestsDataContainerProps {
  requiredPermission: string;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderAccessDenied?: () => ReactNode;
  render: (props: {
    guests: Guest[];
    paginatedGuests: Guest[];
    filteredGuests: Guest[];
    sortedGuests: Guest[];
    pagination: any;
    filters: any;
    sorting: any;
    permissions: {
      canView: boolean;
      canCreate: boolean;
      canEdit: boolean;
      userRole: string;
    };
    auth: {
      propertyId: string | null;
      user: any;
    };
  }) => ReactNode;
}

export const GuestsDataContainer: React.FC<GuestsDataContainerProps> = ({
  requiredPermission,
  renderLoading,
  renderError,
  renderEmpty,
  renderAccessDenied,
  render,
}) => {
  const { propertyId, user } = useAuth();
  const { hasPermission, userRole } = usePermission();
  const { isLoading, error, hasAccess } = usePageData(requiredPermission);
  const { guests } = useAppStore();

  // Apply filtering, sorting, and pagination
  const filterableKeys: (keyof Guest)[] = ['name', 'segment', 'nationality'];
  const filtered = useFilteredData(guests, filterableKeys);
  const sorted = useSortedData(filtered.filtered, 'name');
  const pagination = usePaginatedData(sorted.sorted, 20);

  // Check permissions
  const canViewGuests = hasPermission('view:guests');
  const canCreateGuest = hasPermission('create:guest');
  const canEditGuest = hasPermission('update:guest');

  // Loading state
  if (isLoading) {
    return renderLoading ? renderLoading() : <div className="p-4">Loading guests...</div>;
  }

  // Permission check
  if (!canViewGuests || !hasAccess) {
    return renderAccessDenied ? (
      renderAccessDenied()
    ) : (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-gray-400">You do not have permission to view guests.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return renderError ? (
      renderError(error)
    ) : (
      <div className="p-4 bg-red-900 text-red-100 rounded">Error loading guests: {error}</div>
    );
  }

  // Empty state
  if (guests.length === 0) {
    // TEMP LOGS: show store counts for QA
    console.log('[QA] GuestsDataContainer - store guests count:', guests.length, 'propertyId from auth:', propertyId);
    return renderEmpty ? (
      renderEmpty()
    ) : (
      <div className="p-4 text-center text-gray-400">No guests found</div>
    );
  }

  return (
    <>
      {render({
        guests,
        paginatedGuests: pagination.items,
        filteredGuests: filtered.filtered,
        sortedGuests: sorted.sorted,
        pagination,
        filters: filtered,
        sorting: sorted,
        permissions: {
          canView: canViewGuests,
          canCreate: canCreateGuest,
          canEdit: canEditGuest,
          userRole,
        },
        auth: {
          propertyId,
          user,
        },
      })}
    </>
  );
};
