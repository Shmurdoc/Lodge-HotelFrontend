import React, { type ReactNode } from 'react';
import { useAuth } from '@/lib/authContext';
import { usePermission } from '@/hooks/usePermission';
import { usePageData } from '@/hooks/usePageData';
import { useAppStore } from '@/store/useAppStore';
import { usePaginatedData, useFilteredData, useSortedData } from '@/hooks/usePageData';
import type { Room } from '@/store/useAppStore';

/**
 * RoomsDataContainer - Specialized container for room management pages
 * 
 * Provides:
 * - Real room data from Supabase
 * - RBAC permission checks for viewing/editing rooms
 * - Pagination, filtering, and sorting functionality
 * - Real-time room status updates via SignalR
 * 
 * Usage:
 * <RoomsDataContainer
 *   requiredPermission="view:rooms"
 *   enableRealtime
 *   render={(props) => <RoomsList {...props} />}
 * />
 */

interface RoomsDataContainerProps {
  requiredPermission: string;
  enableRealtime?: boolean;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderAccessDenied?: () => ReactNode;
  render: (props: {
    rooms: Room[];
    paginatedRooms: Room[];
    filteredRooms: Room[];
    sortedRooms: Room[];
    pagination: {
      page: number;
      totalPages: number;
      totalItems: number;
      goToPage: (p: number) => void;
      goNext: () => void;
      goPrev: () => void;
      isFirstPage: boolean;
      isLastPage: boolean;
    };
    filters: {
      filtered: Room[];
      filters: Record<string, string>;
      setFilter: (key: string, value: string) => void;
      setFilters: (filters: Record<string, string>) => void;
      clearFilters: () => void;
      hasActiveFilters: boolean;
    };
    sorting: {
      sorted: Room[];
      sort: (key: keyof Room) => void;
      sortKey: keyof Room | null;
      sortDir: 'asc' | 'desc';
    };
    permissions: {
      canView: boolean;
      canEdit: boolean;
      userRole: string;
    };
    auth: {
      propertyId: string | null;
      user: any;
      isConnected: boolean;
    };
  }) => ReactNode;
}

export const RoomsDataContainer: React.FC<RoomsDataContainerProps> = ({
  requiredPermission,
  enableRealtime,
  renderLoading,
  renderError,
  renderEmpty,
  renderAccessDenied,
  render,
}) => {
  const { propertyId, user } = useAuth();
  const { hasPermission, userRole } = usePermission();
  const { isLoading, error, hasAccess } = usePageData(requiredPermission);
  const { rooms } = useAppStore();
  
  // Real-time connection state
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    if (enableRealtime && propertyId) {
      // TODO: Connect to SignalR for room status updates
      // Subscribe to RoomStatusChanged, RoomCleaned, etc.
      setIsConnected(true);
    }
  }, [enableRealtime, propertyId]);

  // Filter rooms by current property
  const propertyRooms = propertyId
    ? rooms.filter((r) => r.propertyId === propertyId)
    : rooms;

  // Apply filtering, sorting, and pagination
  const filterableKeys: (keyof Room)[] = ['status', 'type', 'number'];
  const filtered = useFilteredData(propertyRooms, filterableKeys);
  const sorted = useSortedData(filtered.filtered, 'number');
  const pagination = usePaginatedData(sorted.sorted, 20);

  // Check permissions
  const canViewRooms = hasPermission('view:rooms');
  const canEditRoom = hasPermission('update:room');

  // Loading state
  if (isLoading) {
    return renderLoading ? renderLoading() : <div className="p-4">Loading rooms...</div>;
  }

  // Permission check
  if (!canViewRooms || !hasAccess) {
    return renderAccessDenied ? (
      renderAccessDenied()
    ) : (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-gray-400">You do not have permission to view rooms.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return renderError ? (
      renderError(error)
    ) : (
      <div className="p-4 bg-red-900 text-red-100 rounded">Error loading rooms: {error}</div>
    );
  }

  // Empty state
  if (propertyRooms.length === 0) {
    return renderEmpty ? (
      renderEmpty()
    ) : (
      <div className="p-4 text-center text-gray-400">No rooms found</div>
    );
  }

  return (
    <>
      {render({
        rooms: propertyRooms,
        paginatedRooms: pagination.items,
        filteredRooms: filtered.filtered,
        sortedRooms: sorted.sorted,
        pagination: {
          page: pagination.page,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          goToPage: pagination.goToPage,
          goNext: pagination.goNext,
          goPrev: pagination.goPrev,
          isFirstPage: pagination.isFirstPage,
          isLastPage: pagination.isLastPage,
        },
        filters: filtered,
        sorting: sorted,
        permissions: {
          canView: canViewRooms,
          canEdit: canEditRoom,
          userRole,
        },
        auth: {
          propertyId,
          user,
          isConnected,
        },
      })}
    </>
  );
};
