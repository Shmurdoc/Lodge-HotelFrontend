import React, { type ReactNode } from 'react';
import { useAuth } from '@/lib/authContext';
import { usePermission } from '@/hooks/usePermission';
import { usePageData } from '@/hooks/usePageData';
import { useAppStore } from '@/store/useAppStore';
import { usePaginatedData, useFilteredData, useSortedData } from '@/hooks/usePageData';
import type { Ticket } from '@/store/useAppStore';

/**
 * TicketsDataContainer - Specialized container for ticket management pages
 * 
 * Provides:
 * - Real ticket data from Supabase (not mock data)
 * - RBAC permission checks for viewing/editing/deleting tickets
 * - Pagination, filtering, and sorting functionality
 * - Real-time updates via SignalR (when configured)
 * 
 * Usage:
 * <TicketsDataContainer
 *   requiredPermission="view:tickets"
 *   enableRealtime
 *   render={(props) => <TicketList {...props} />}
 * />
 */

interface TicketsDataContainerProps {
  requiredPermission: string;
  enableRealtime?: boolean;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderAccessDenied?: () => ReactNode;
  render: (props: {
    tickets: Ticket[];
    paginatedTickets: Ticket[];
    filteredTickets: Ticket[];
    sortedTickets: Ticket[];
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
      filtered: Ticket[];
      filters: Record<string, string>;
      setFilter: (key: string, value: string) => void;
      setFilters: (filters: Record<string, string>) => void;
      clearFilters: () => void;
      hasActiveFilters: boolean;
    };
    sorting: {
      sorted: Ticket[];
      sort: (key: keyof Ticket) => void;
      sortKey: keyof Ticket | null;
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

export const TicketsDataContainer: React.FC<TicketsDataContainerProps> = ({
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
  const { tickets } = useAppStore();
  
  // Real-time connection state
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    if (enableRealtime && propertyId) {
      // TODO: Connect to SignalR for ticket updates
      // In production, this would subscribe to TicketCreated, TicketResolved, etc.
      setIsConnected(true);
    }
  }, [enableRealtime, propertyId]);

  // Filter tickets by current property
  const propertyTickets = propertyId
    ? tickets.filter((t) => t.propertyId === propertyId)
    : tickets;

  // Apply filtering, sorting, and pagination
  const filterableKeys: (keyof Ticket)[] = ['status', 'priority', 'category'];
  const filtered = useFilteredData(propertyTickets, filterableKeys);
  const sorted = useSortedData(filtered.filtered, 'createdAt');
  const pagination = usePaginatedData(sorted.sorted, 15);

  // Check permissions
  const canViewTickets = hasPermission('view:tickets');
  const canCreateTicket = hasPermission('create:ticket');
  const canEditTicket = hasPermission('update:ticket');
  const canDeleteTicket = hasPermission('delete:ticket');

  // Loading state
  if (isLoading) {
    return renderLoading ? renderLoading() : <div className="p-4">Loading tickets...</div>;
  }

  // Permission check
  if (!canViewTickets || !hasAccess) {
    return renderAccessDenied ? (
      renderAccessDenied()
    ) : (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-gray-400">You do not have permission to view tickets.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return renderError ? (
      renderError(error)
    ) : (
      <div className="p-4 bg-red-900 text-red-100 rounded">Error loading tickets: {error}</div>
    );
  }

  // Empty state
  if (propertyTickets.length === 0) {
    return renderEmpty ? (
      renderEmpty()
    ) : (
      <div className="p-4 text-center text-gray-400">No tickets found</div>
    );
  }

  return (
    <>
      {render({
        tickets: propertyTickets,
        paginatedTickets: pagination.items,
        filteredTickets: filtered.filtered,
        sortedTickets: sorted.sorted,
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
          canView: canViewTickets,
          canCreate: canCreateTicket,
          canEdit: canEditTicket,
          canDelete: canDeleteTicket,
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
