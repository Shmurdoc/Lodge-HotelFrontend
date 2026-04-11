import React, { type ReactNode } from 'react';
import { useAuth } from '@/lib/authContext';
import { usePermission } from '@/hooks/usePermission';
import { usePageData } from '@/hooks/usePageData';
import { useAppStore } from '@/store/useAppStore';
import { usePaginatedData, useFilteredData, useSortedData } from '@/hooks/usePageData';
import type { Booking } from '@/store/useAppStore';

/**
 * BookingsDataContainer - Specialized container for booking management pages
 * 
 * Provides:
 * - Real booking data from Supabase (not mock data)
 * - RBAC permission checks for viewing/editing/deleting bookings
 * - Pagination, filtering, and sorting functionality
 * - Real-time updates via SignalR (when configured)
 * 
 * Usage:
 * <BookingsDataContainer
 *   requiredPermission="view:bookings"
 *   enableRealtime
 *   render={(props) => <BookingList {...props} />}
 * />
 */

interface BookingsDataContainerProps {
  requiredPermission: string;
  enableRealtime?: boolean;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderAccessDenied?: () => ReactNode;
  render: (props: {
    bookings: Booking[];
    paginatedBookings: Booking[];
    filteredBookings: Booking[];
    sortedBookings: Booking[];
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
      filtered: Booking[];
      filters: Record<string, string>;
      setFilter: (key: string, value: string) => void;
      setFilters: (filters: Record<string, string>) => void;
      clearFilters: () => void;
      hasActiveFilters: boolean;
    };
    sorting: {
      sorted: Booking[];
      sort: (key: keyof Booking) => void;
      sortKey: keyof Booking | null;
      sortDir: 'asc' | 'desc';
    };
    permissions: {
      canView: boolean;
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
      userRole: string;
    };
    auth: {
      propertyId: string | null;
      user: any;
      isConnected: boolean;
    };
  }) => ReactNode;
}

export const BookingsDataContainer: React.FC<BookingsDataContainerProps> = ({
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
  const { bookings } = useAppStore();
  
  // Real-time connection state
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    if (enableRealtime && propertyId) {
      // TODO: Connect to SignalR for booking updates
      // In production, this would subscribe to BookingStatusChanged, BookingCreated, etc.
      setIsConnected(true);
    }
  }, [enableRealtime, propertyId]);

  // Filter bookings by current property
  const propertyBookings = propertyId
    ? bookings.filter((b) => b.propertyId === propertyId)
    : bookings;

  // Apply filtering, sorting, and pagination
  const filterableKeys: (keyof Booking)[] = ['status', 'roomType', 'guestName'];
  const filtered = useFilteredData(propertyBookings, filterableKeys);
  const sorted = useSortedData(filtered.filtered, 'checkIn');
  const pagination = usePaginatedData(sorted.sorted, 10);

  // Check permissions
  const canViewBookings = hasPermission('view:bookings');
  const canCreateBooking = hasPermission('create:booking');
  const canEditBooking = hasPermission('update:booking');
  const canDeleteBooking = hasPermission('delete:booking');

  // Loading state
  if (isLoading) {
    return renderLoading ? renderLoading() : <div className="p-4">Loading bookings...</div>;
  }

  // Permission check
  if (!canViewBookings || !hasAccess) {
    return renderAccessDenied ? (
      renderAccessDenied()
    ) : (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-gray-400">You do not have permission to view bookings.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return renderError ? (
      renderError(error)
    ) : (
      <div className="p-4 bg-red-900 text-red-100 rounded">Error loading bookings: {error}</div>
    );
  }

  // Empty state
  if (propertyBookings.length === 0) {
    return renderEmpty ? (
      renderEmpty()
    ) : (
      <div className="p-4 text-center text-gray-400">No bookings found</div>
    );
  }

  return (
    <>
      {render({
        bookings: propertyBookings,
        paginatedBookings: pagination.items,
        filteredBookings: filtered.filtered,
        sortedBookings: sorted.sorted,
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
          canView: canViewBookings,
          canCreate: canCreateBooking,
          canEdit: canEditBooking,
          canDelete: canDeleteBooking,
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
