// ============================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================
// Centralized permission system for multi-tenancy

export type UserRole =
  | 'Administrator'
  | 'Manager'
  | 'Supervisor'
  | 'Staff'
  | 'Finance Manager'
  | 'Accountant'
  | 'HR Manager'
  | 'Front Desk Manager'
  | 'Front Desk'
  | 'Housekeeping Supervisor'
  | 'Housekeeping'
  | 'Maintenance Manager'
  | 'Maintenance'
  | 'Chef'
  | 'Kitchen Staff'
  | 'Concierge'
  | 'Security Officer'
  | 'Guest';

export type Permission =
  | 'view:bookings'
  | 'create:booking'
  | 'update:booking'
  | 'delete:booking'
  | 'view:guests'
  | 'create:guest'
  | 'update:guest'
  | 'view:rooms'
  | 'update:room'
  | 'view:staff'
  | 'manage:staff'
  | 'view:finances'
  | 'manage:finances'
  | 'create:invoice'
  | 'create:payment'
  | 'view:tickets'
  | 'create:ticket'
  | 'manage:tickets'
  | 'view:maintenance'
  | 'create:maintenance'
  | 'view:inventory'
  | 'manage:inventory'
  | 'view:attendance'
  | 'manage:shifts'
  | 'view:reports'
  | 'manage:settings'
  | 'view:audit_logs'
  | 'manage:integrations'
  | 'admin:all';

// Permission matrix: role -> permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Admin - Full access
  Administrator: [
    'admin:all',
    'view:bookings',
    'create:booking',
    'update:booking',
    'delete:booking',
    'view:guests',
    'create:guest',
    'update:guest',
    'view:rooms',
    'update:room',
    'view:staff',
    'manage:staff',
    'view:finances',
    'manage:finances',
    'create:invoice',
    'create:payment',
    'view:tickets',
    'create:ticket',
    'manage:tickets',
    'view:maintenance',
    'create:maintenance',
    'view:inventory',
    'manage:inventory',
    'view:attendance',
    'manage:shifts',
    'view:reports',
    'manage:settings',
    'view:audit_logs',
    'manage:integrations',
  ],

  // Manager - Most permissions
  Manager: [
    'view:bookings',
    'create:booking',
    'update:booking',
    'view:guests',
    'create:guest',
    'update:guest',
    'view:rooms',
    'update:room',
    'view:staff',
    'manage:staff',
    'view:finances',
    'manage:finances',
    'create:invoice',
    'create:payment',
    'view:tickets',
    'create:ticket',
    'manage:tickets',
    'view:maintenance',
    'create:maintenance',
    'view:inventory',
    'manage:inventory',
    'view:attendance',
    'manage:shifts',
    'view:reports',
  ],

  // Supervisor - Department-level permissions
  Supervisor: [
    'view:bookings',
    'view:guests',
    'view:rooms',
    'view:staff',
    'view:tickets',
    'create:ticket',
    'manage:tickets',
    'view:maintenance',
    'view:inventory',
    'view:attendance',
    'view:reports',
  ],

  // Finance Manager
  'Finance Manager': [
    'view:bookings',
    'view:guests',
    'view:finances',
    'manage:finances',
    'create:invoice',
    'create:payment',
    'view:reports',
  ],

  // Accountant
  Accountant: [
    'view:bookings',
    'view:guests',
    'view:finances',
    'create:invoice',
    'create:payment',
    'view:reports',
  ],

  // HR Manager
  'HR Manager': [
    'view:staff',
    'manage:staff',
    'view:attendance',
    'manage:shifts',
  ],

  // Front Desk Manager
  'Front Desk Manager': [
    'view:bookings',
    'create:booking',
    'update:booking',
    'view:guests',
    'create:guest',
    'update:guest',
    'view:rooms',
    'update:room',
    'view:tickets',
    'create:ticket',
    'manage:tickets',
  ],

  // Front Desk Staff
  'Front Desk': [
    'view:bookings',
    'create:booking',
    'update:booking',
    'view:guests',
    'create:guest',
    'update:guest',
    'view:rooms',
    'view:tickets',
    'create:ticket',
  ],

  // Housekeeping Supervisor
  'Housekeeping Supervisor': [
    'view:rooms',
    'update:room',
    'view:tickets',
    'create:ticket',
    'manage:tickets',
    'view:inventory',
    'view:staff',
    'view:reports',
  ],

  // Housekeeping Staff
  Housekeeping: [
    'view:rooms',
    'update:room',
    'view:tickets',
    'create:ticket',
  ],

  // Maintenance Manager
  'Maintenance Manager': [
    'view:rooms',
    'update:room',
    'view:maintenance',
    'create:maintenance',
    'view:inventory',
    'manage:inventory',
    'view:tickets',
    'create:ticket',
    'manage:tickets',
  ],

  // Maintenance Staff
  Maintenance: [
    'view:rooms',
    'update:room',
    'view:maintenance',
    'create:maintenance',
    'view:inventory',
    'view:tickets',
    'create:ticket',
  ],

  // Chef
  Chef: [
    'view:inventory',
    'manage:inventory',
    'view:tickets',
    'create:ticket',
  ],

  // Kitchen Staff
  'Kitchen Staff': [
    'view:inventory',
    'view:tickets',
    'create:ticket',
  ],

  // Concierge
  Concierge: [
    'view:bookings',
    'view:guests',
    'view:rooms',
    'view:tickets',
    'create:ticket',
  ],

  // Security Officer
  'Security Officer': [
    'view:bookings',
    'view:staff',
    'view:tickets',
    'create:ticket',
    'view:reports',
  ],

  // Guest - Minimal permissions
  Guest: [
    'view:bookings', // Their own bookings only
  ],

  // Staff - Base permissions
  Staff: [
    'view:bookings',
    'view:guests',
    'view:rooms',
    'view:tickets',
    'create:ticket',
  ],
};

// ============================================
// RBAC FUNCTIONS
// ============================================

export const rbacService = {
  /**
   * Check if user has specific permission
   */
  hasPermission(role: UserRole, permission: Permission): boolean {
    if (permission === 'admin:all' && role === 'Administrator') {
      return true;
    }
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission) || permissions.includes('admin:all');
  },

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some((p) => this.hasPermission(role, p));
  },

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every((p) => this.hasPermission(role, p));
  },

  /**
   * Get all permissions for a role
   */
  getPermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  },

  /**
   * Check if user can perform action on resource
   * Supports property scoping
   */
  canAccess(
    userRole: UserRole,
    userPropertyId: string,
    resourcePropertyId: string,
    permission: Permission
  ): boolean {
    // Check role has permission
    if (!this.hasPermission(userRole, permission)) {
      return false;
    }

    // Check property scoping (unless admin)
    if (userRole !== 'Administrator') {
      return userPropertyId === resourcePropertyId;
    }

    return true;
  },

  /**
   * Get editable fields for a role
   */
  getEditableFields(role: UserRole, entityType: string): string[] {
    const editableFieldMap: Record<string, Record<UserRole, string[]>> = {
      booking: {
        Administrator: ['status', 'paymentStatus', 'specialRequests', 'notes'],
        Manager: ['status', 'paymentStatus', 'specialRequests', 'notes'],
        'Front Desk Manager': ['status', 'specialRequests', 'notes'],
        'Front Desk': ['specialRequests', 'notes'],
        Guest: [],
        Supervisor: ['status', 'notes'],
        Staff: ['notes'],
        'Finance Manager': ['paymentStatus'],
        Accountant: ['paymentStatus'],
        'HR Manager': [],
        'Housekeeping Supervisor': ['status'],
        Housekeeping: [],
        'Maintenance Manager': [],
        Maintenance: [],
        Chef: [],
        'Kitchen Staff': [],
        Concierge: ['notes'],
        'Security Officer': [],
      },
      room: {
        Administrator: ['status', 'price', 'amenities', 'description'],
        Manager: ['status', 'price', 'amenities', 'description'],
        'Front Desk Manager': ['status'],
        'Housekeeping Supervisor': ['status'],
        Housekeeping: ['status'],
        'Maintenance Manager': ['status'],
        Maintenance: ['status'],
        'Front Desk': [],
        Guest: [],
        Supervisor: ['status'],
        Staff: [],
        'Finance Manager': [],
        Accountant: [],
        'HR Manager': [],
        Chef: [],
        'Kitchen Staff': [],
        Concierge: [],
        'Security Officer': [],
      },
      guest: {
        Administrator: [
          'name',
          'email',
          'phone',
          'preferences',
          'notes',
          'vipLevel',
        ],
        Manager: ['name', 'email', 'phone', 'preferences', 'notes', 'vipLevel'],
        'Front Desk Manager': [
          'name',
          'email',
          'phone',
          'preferences',
          'notes',
        ],
        'Front Desk': ['preferences', 'notes'],
        Concierge: ['preferences', 'notes'],
        Guest: ['preferences'],
        Supervisor: ['notes'],
        Staff: ['notes'],
        'Finance Manager': [],
        Accountant: [],
        'HR Manager': [],
        'Housekeeping Supervisor': [],
        Housekeeping: [],
        'Maintenance Manager': [],
        Maintenance: [],
        Chef: [],
        'Kitchen Staff': [],
        'Security Officer': [],
      },
    };

    return editableFieldMap[entityType]?.[role] || [];
  },
};

// ============================================
// RBAC REACT HOOKS
// ============================================

// Helper function to get human-readable role label
export const getRoleLabel = (role: UserRole | string): string => {
  const labels: Record<string, string> = {
    'Administrator': 'Admin',
    'Manager': 'Manager',
    'Supervisor': 'Supervisor',
    'Staff': 'Staff',
    'Finance Manager': 'Finance Manager',
    'Accountant': 'Accountant',
    'HR Manager': 'HR Manager',
    'Front Desk Manager': 'Front Desk Manager',
    'Front Desk': 'Front Desk',
    'Housekeeping Supervisor': 'Housekeeping Lead',
    'Housekeeping': 'Housekeeping',
    'Maintenance Manager': 'Maintenance Manager',
    'Maintenance': 'Maintenance',
    'Chef': 'Chef',
    'Kitchen Staff': 'Kitchen Staff',
    'Concierge': 'Concierge',
    'Security Officer': 'Security',
    'Guest': 'Guest',
    // Lowercase aliases for backwards compatibility
    'admin': 'Admin',
    'manager': 'Manager',
    'front_desk': 'Front Desk',
    'housekeeping': 'Housekeeping',
  };
  return labels[role] || role;
};

export const useRbac = (userRole: UserRole | null) => {
  return {
    hasPermission: (permission: Permission) =>
      userRole ? rbacService.hasPermission(userRole, permission) : false,
    hasAnyPermission: (permissions: Permission[]) =>
      userRole ? rbacService.hasAnyPermission(userRole, permissions) : false,
    hasAllPermissions: (permissions: Permission[]) =>
      userRole ? rbacService.hasAllPermissions(userRole, permissions) : false,
    getPermissions: () => (userRole ? rbacService.getPermissions(userRole) : []),
    canAccess: (userPropertyId: string, resourcePropertyId: string, permission: Permission) =>
      userRole ? rbacService.canAccess(userRole, userPropertyId, resourcePropertyId, permission) : false,
  };
};

export default rbacService;
