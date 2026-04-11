import React, { type ReactNode } from 'react';
import { useAuth } from '@/lib/authContext';
import { usePermission } from '@/hooks/usePermission';
import { usePageData } from '@/hooks/usePageData';
import { useAppStore } from '@/store/useAppStore';
import { usePaginatedData, useFilteredData, useSortedData } from '@/hooks/usePageData';
import type { User } from '@/store/useAppStore';

/**
 * EmployeesDataContainer - Specialized container for staff/employee management pages
 * 
 * Provides:
 * - Real employee data from Supabase
 * - RBAC permission checks for viewing/managing staff
 * - Pagination, filtering, and sorting functionality
 */

interface EmployeesDataContainerProps {
  requiredPermission: string;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderAccessDenied?: () => ReactNode;
  render: (props: {
    employees: User[];
    paginatedEmployees: User[];
    filteredEmployees: User[];
    sortedEmployees: User[];
    pagination: any;
    filters: any;
    sorting: any;
    permissions: {
      canView: boolean;
      canManage: boolean;
      userRole: string;
    };
    auth: {
      propertyId: string | null;
      user: any;
    };
  }) => ReactNode;
}

export const EmployeesDataContainer: React.FC<EmployeesDataContainerProps> = ({
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
  const { users } = useAppStore();

  // Apply filtering, sorting, and pagination
  const filterableKeys: (keyof User)[] = ['name', 'department', 'role'];
  const filtered = useFilteredData(users, filterableKeys);
  const sorted = useSortedData(filtered.filtered, 'name');
  const pagination = usePaginatedData(sorted.sorted, 20);

  // Check permissions
  const canViewStaff = hasPermission('view:staff');
  const canManageStaff = hasPermission('manage:staff');

  // Loading state
  if (isLoading) {
    return renderLoading ? renderLoading() : <div className="p-4">Loading employees...</div>;
  }

  // Permission check
  if (!canViewStaff || !hasAccess) {
    return renderAccessDenied ? (
      renderAccessDenied()
    ) : (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-gray-400">You do not have permission to view staff.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return renderError ? (
      renderError(error)
    ) : (
      <div className="p-4 bg-red-900 text-red-100 rounded">Error loading employees: {error}</div>
    );
  }

  // Empty state
  if (users.length === 0) {
    return renderEmpty ? (
      renderEmpty()
    ) : (
      <div className="p-4 text-center text-gray-400">No employees found</div>
    );
  }

  return (
    <>
      {render({
        employees: users,
        paginatedEmployees: pagination.items,
        filteredEmployees: filtered.filtered,
        sortedEmployees: sorted.sorted,
        pagination,
        filters: filtered,
        sorting: sorted,
        permissions: {
          canView: canViewStaff,
          canManage: canManageStaff,
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
