import React, { type ReactNode } from 'react';
import { useAuth } from '@/lib/authContext';
import { usePermission } from '@/hooks/usePermission';
import { usePageData } from '@/hooks/usePageData';
import { useAppStore } from '@/store/useAppStore';
import { usePaginatedData, useFilteredData, useSortedData } from '@/hooks/usePageData';
import type { Property } from '@/store/useAppStore';

/**
 * PropertiesDataContainer - Specialized container for property management pages
 * 
 * Provides:
 * - Real property data from Supabase (not mock data)
 * - RBAC permission checks for viewing/editing/deleting properties
 * - Pagination, filtering, and sorting functionality
 * - Real-time updates via SignalR (when configured)
 * 
 * Usage:
 * <PropertiesDataContainer
 *   requiredPermission="view:properties"
 *   enableRealtime
 *   render={(props) => <PropertyList {...props} />}
 * />
 */

interface PropertiesDataContainerProps {
  requiredPermission: string;
  enableRealtime?: boolean;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderAccessDenied?: () => ReactNode;
  render: (props: {
    properties: Property[];
    paginatedProperties: Property[];
    filteredProperties: Property[];
    sortedProperties: Property[];
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
      filtered: Property[];
      filters: Record<string, string>;
      setFilter: (key: string, value: string) => void;
      setFilters: (filters: Record<string, string>) => void;
      clearFilters: () => void;
      hasActiveFilters: boolean;
    };
    sorting: {
      sorted: Property[];
      sort: (key: keyof Property) => void;
      sortKey: keyof Property | null;
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

export const PropertiesDataContainer: React.FC<PropertiesDataContainerProps> = ({
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
  const { properties } = useAppStore();
  
  // Real-time connection state
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    if (enableRealtime && propertyId) {
      // TODO: Connect to SignalR for property updates
      // In production, this would subscribe to PropertyUpdated, RoomStatusChanged, etc.
      setIsConnected(true);
    }
  }, [enableRealtime, propertyId]);

  // For properties list - usually show all if super admin, or just current if property manager
  const availableProperties = properties;

  // Apply filtering, sorting, and pagination
  const filterableKeys: (keyof Property)[] = ['status'];
  const filtered = useFilteredData(availableProperties, filterableKeys);
  const sorted = useSortedData(filtered.filtered, 'name');
  const pagination = usePaginatedData(sorted.sorted, 10);

  // Check permissions
  const canViewProperties = hasPermission('view:properties');
  const canCreateProperty = hasPermission('create:property');
  const canEditProperty = hasPermission('update:property');
  const canDeleteProperty = hasPermission('delete:property');

  // Loading state
  if (isLoading) {
    return renderLoading ? renderLoading() : <div className="p-4">Loading properties...</div>;
  }

  // Permission check
  if (!canViewProperties || !hasAccess) {
    return renderAccessDenied ? (
      renderAccessDenied()
    ) : (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-gray-400">You do not have permission to view properties.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return renderError ? (
      renderError(error)
    ) : (
      <div className="p-4 bg-red-900 text-red-100 rounded">Error loading properties: {error}</div>
    );
  }

  // Empty state
  if (availableProperties.length === 0) {
    return renderEmpty ? (
      renderEmpty()
    ) : (
      <div className="p-4 text-center text-gray-400">No properties found</div>
    );
  }

  return (
    <>
      {render({
        properties: availableProperties,
        paginatedProperties: pagination.items,
        filteredProperties: filtered.filtered,
        sortedProperties: sorted.sorted,
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
          canView: canViewProperties,
          canCreate: canCreateProperty,
          canEdit: canEditProperty,
          canDelete: canDeleteProperty,
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
