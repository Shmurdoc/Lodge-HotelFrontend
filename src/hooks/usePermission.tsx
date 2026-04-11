import { useAuth } from '@/lib/authContext';
import { rbacService } from '@/lib/rbac';
import type { UserRole } from '@/lib/rbac';

/**
 * usePermission - Hook for checking user permissions
 * 
 * Usage:
 * const { hasPermission, canEdit, canDelete, getEditableFields } = usePermission();
 * 
 * if (!canEdit('booking')) return <PermissionDenied />;
 * const fields = getEditableFields('booking');
 */
export const usePermission = () => {
  const { user, propertyId } = useAuth();

  const userRole = (user?.role as UserRole) || 'Guest';

  return {
    /**
     * Check if user has a specific permission
     */
    hasPermission: (permission: string): boolean => {
      if (!user) return false;
      return rbacService.hasPermission(userRole as any, permission as any);
    },

    /**
     * Check if user can create a specific entity
     */
    canCreate: (entity: string): boolean => {
      return rbacService.hasPermission(userRole as any, `create:${entity}` as any);
    },

    /**
     * Check if user can read/view a specific entity
     */
    canView: (entity: string): boolean => {
      return rbacService.hasPermission(userRole as any, `view:${entity}` as any);
    },

    /**
     * Check if user can edit a specific entity
     */
    canEdit: (entity: string): boolean => {
      return rbacService.hasPermission(userRole as any, `update:${entity}` as any);
    },

    /**
     * Check if user can delete a specific entity
     */
    canDelete: (entity: string): boolean => {
      return rbacService.hasPermission(userRole as any, `delete:${entity}` as any);
    },

    /**
     * Get all permissions for the current user
     */
    getPermissions: (): string[] => {
      const permissions = rbacService.getPermissions(userRole as any);
      return permissions;
    },

    /**
     * Get fields that user can edit for a specific entity
     */
    getEditableFields: (entity: string): string[] => {
      return rbacService.getEditableFields(userRole as any, entity);
    },

    /**
     * Check if user can access data for a specific property
     */
    canAccessProperty: (targetPropertyId: string): boolean => {
      if (!propertyId) return false;
      // Admins can access any property; others can only access their own
      return userRole === 'Administrator' || propertyId === targetPropertyId;
    },

    /**
     * Get the current user's role
     */
    userRole,

    /**
     * Get the current user
     */
    user,

    /**
     * Get the current property ID (for multi-tenancy)
     */
    propertyId,
  };
};

/**
 * withPermission - HOC for protecting pages/components
 * 
 * Usage:
 * export default withPermission(MyPage, 'view:bookings');
 */
export const withPermission = (Component: React.ComponentType<any>, requiredPermission: string) => {
  return function ProtectedComponent(props: any) {
    const { hasPermission } = usePermission();

    if (!hasPermission(requiredPermission)) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
            <p className="text-gray-400">You do not have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

/**
 * withRole - HOC for protecting pages/components by role
 * 
 * Usage:
 * export default withRole(MyPage, ['admin', 'manager']);
 */
export const withRole = (Component: React.ComponentType<any>, allowedRoles: UserRole[]) => {
  return function ProtectedComponent(props: any) {
    const { userRole } = usePermission();

    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
            <p className="text-gray-400">Your role does not have access to this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};
