import React from 'react';
import { usePageData, usePaginatedData, useFilteredData, useSortedData } from './usePageData';
import { usePermission } from './usePermission';
import { useAuth } from '../lib/authContext';

/**
 * DataEnhancedPage - HOC that wraps pages with data loading, real-time updates, RBAC checks, and UI helpers
 * 
 * Usage:
 * const EnhancedBookingPage = withDataEnhancement(BookingManagementPage, {
 *   requiredPermission: 'view:bookings',
 *   enableRealtime: true,
 *   realtimeEvents: ['BookingStatusChanged'],
 * });
 */

export interface DataEnhancementConfig {
  requiredPermission: string;
  enableRealtime?: boolean;
  realtimeEvents?: string[];
  pageTitle?: string;
}

export interface EnhancedPageProps {
  // Data loading
  isLoading: boolean;
  hasAccess: boolean;
  isReady: boolean;
  error: string | null;

  // Permissions & Auth
  userRole: string;
  user: any;
  propertyId: string | null;
  canEdit: (entity: string) => boolean;
  canDelete: (entity: string) => boolean;
  canCreate: (entity: string) => boolean;

  // Real-time
  isConnected: boolean;
  lastUpdate: Date | null;
}

export const withDataEnhancement =
  (Component: React.ComponentType<any>, config: DataEnhancementConfig) =>
  (props: any) => {
    const { isLoading, hasAccess, propertyId, user } = usePageData(config.requiredPermission);
    const { userRole, canEdit, canDelete, canCreate } = usePermission();
    const { propertyId: authPropertyId } = useAuth();

    // Setup real-time if enabled
    const [isConnected, setIsConnected] = React.useState(false);

    React.useEffect(() => {
      if (config.enableRealtime && authPropertyId) {
        // Placeholder for real-time setup
        // Actual implementation would subscribe to SignalR events
        setIsConnected(true);
      }
    }, [config.enableRealtime, authPropertyId]);

    if (!hasAccess) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
            <p className="text-gray-400">You do not have permission to access this page.</p>
          </div>
        </div>
      );
    }

    const enhancedProps = {
      ...props,
      isLoading,
      hasAccess,
      isReady: !isLoading && hasAccess,
      error: undefined,
      userRole,
      user,
      propertyId,
      canEdit,
      canDelete,
      canCreate,
      isConnected,
      lastUpdate: null as Date | null,
    };

    return <Component {...enhancedProps} />;
  };

/**
 * PageDataContainer - A reusable container component for managing page data state
 * 
 * Usage:
 * <PageDataContainer
 *   permission="view:bookings"
 *   enableRealtime
 *   renderLoading={() => <Spinner />}
 *   render={(data) => <BookingList bookings={data.items} />}
 * />
 */

interface PageDataContainerProps<T> {
  permission: string;
  items: T[];
  enableRealtime?: boolean;
  renderLoading?: () => React.ReactNode;
  renderError?: (error: string) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  render: (props: {
    items: T[];
    paginatedItems: T[];
    filteredItems: T[];
    sortedItems: T[];
    pagination: any;
    filters: any;
    sorting: any;
    utils: any;
  }) => React.ReactNode;
}

export const PageDataContainer = <T extends any>({
  permission,
  items,
  enableRealtime,
  renderLoading,
  renderError,
  renderEmpty,
  render,
}: PageDataContainerProps<T>) => {
  const { isLoading, hasAccess, error } = usePageData(permission);
  const { propertyId } = useAuth();
  const filtered = useFilteredData(items, Object.keys(items[0] || {}) as any);
  const sorted = useSortedData(filtered.filtered);
  const pagination = usePaginatedData(sorted.sorted, 10);

  if (isLoading) {
    return renderLoading ? renderLoading() : <div>Loading...</div>;
  }

  if (!hasAccess) {
    return <div>Access Denied</div>;
  }

  if (error) {
    return renderError ? renderError(error) : <div>Error: {error}</div>;
  }

  if (items.length === 0) {
    return renderEmpty ? renderEmpty() : <div>No data available</div>;
  }

  return render({
    items,
    paginatedItems: pagination.items,
    filteredItems: filtered.filtered,
    sortedItems: sorted.sorted,
    pagination,
    filters: filtered,
    sorting: sorted,
    utils: {
      propertyId,
      enableRealtime,
    },
  });
};
