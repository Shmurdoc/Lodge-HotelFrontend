import { toast as sonnerToast } from 'sonner';

export type ToastType = 'default' | 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  duration?: number;
  description?: string;
  [key: string]: unknown;
}

export const toast = {
  success(message: string, options?: ToastOptions) {
    return sonnerToast.success(message, { duration: options?.duration ?? 2000 });
  },

  error(message: string, options?: ToastOptions) {
    return sonnerToast.error(message, { duration: options?.duration ?? 4000 });
  },

  warning(message: string, options?: ToastOptions) {
    return sonnerToast.warning(message, { duration: options?.duration ?? 3000 });
  },

  info(message: string, options?: ToastOptions) {
    return sonnerToast.info(message, { duration: options?.duration ?? 2500 });
  },

  message(message: string, options?: ToastOptions) {
    return sonnerToast(message, { duration: options?.duration ?? 3000 });
  },

  loading(message: string, options?: ToastOptions) {
    return sonnerToast.loading(message, { duration: options?.duration ?? 3000 });
  },

  promise<T>(promise: Promise<T>, messages: { loading: string; success: string; error: string }) {
    return sonnerToast.promise(promise, messages);
  },

  dismiss(toastId?: string | number) {
    sonnerToast.dismiss(toastId);
  },

  dismissAll() {
    sonnerToast.dismiss();
  },

  confirm(message: string, onConfirm: () => void, options?: ToastOptions) {
    return sonnerToast(message, {
      duration: options?.duration ?? 3000,
      action: { label: 'Confirm', onClick: onConfirm },
      description: options?.description,
    });
  },
};

/**
 * Common toast messages for CRUD operations
 */
export const toastMessages = {
  // Success messages
  created: (entity: string) => ({
    message: `${entity} created successfully`,
    type: 'success' as const,
  }),
  updated: (entity: string) => ({
    message: `${entity} updated successfully`,
    type: 'success' as const,
  }),
  deleted: (entity: string) => ({
    message: `${entity} deleted successfully`,
    type: 'success' as const,
  }),
  saved: () => ({
    message: 'Changes saved successfully',
    type: 'success' as const,
  }),
  loaded: (entity: string) => ({
    message: `${entity} loaded successfully`,
    type: 'success' as const,
  }),

  // Error messages
  createError: (entity: string) => ({
    message: `Failed to create ${entity}`,
    type: 'error' as const,
  }),
  updateError: (entity: string) => ({
    message: `Failed to update ${entity}`,
    type: 'error' as const,
  }),
  deleteError: (entity: string) => ({
    message: `Failed to delete ${entity}`,
    type: 'error' as const,
  }),
  loadError: (entity: string) => ({
    message: `Failed to load ${entity}`,
    type: 'error' as const,
  }),
  unexpectedError: () => ({
    message: 'An unexpected error occurred',
    type: 'error' as const,
  }),

  // Warning messages
  unsavedChanges: () => ({
    message: 'You have unsaved changes',
    type: 'warning' as const,
  }),
  confirmDelete: (entity: string) => ({
    message: `Are you sure you want to delete this ${entity}?`,
    type: 'warning' as const,
  }),

  // Info messages
  processing: () => ({
    message: 'Processing your request...',
    type: 'info' as const,
  }),
  syncInProgress: () => ({
    message: 'Syncing data...',
    type: 'info' as const,
  }),
};

export const toastHelpers = {
  success: (title: string, description?: string) => toast.success(description ? `${title}: ${description}` : title),
  error: (title: string, description?: string) => toast.error(description ? `${title}: ${description}` : title),
  warning: (title: string, description?: string) => toast.warning(description ? `${title}: ${description}` : title),
  info: (title: string, description?: string) => toast.info(description ? `${title}: ${description}` : title),
  room: {
    created: () => toast.success('Room created successfully'),
    updated: () => toast.success('Room updated successfully'),
    deleted: () => toast.success('Room deleted successfully'),
    statusChanged: () => toast.success('Room status updated'),
  },
  booking: {
    created: () => toast.success('Booking created successfully'),
    updated: () => toast.success('Booking updated successfully'),
    cancelled: () => toast.success('Booking cancelled'),
    checkedIn: () => toast.success('Guest checked in'),
    checkedOut: () => toast.success('Guest checked out'),
  },
  guest: {
    created: () => toast.success('Guest created successfully'),
    updated: () => toast.success('Guest updated successfully'),
    deleted: () => toast.success('Guest deleted successfully'),
  },
  property: {
    created: () => toast.success('Property created successfully'),
    updated: () => toast.success('Property updated successfully'),
  },
  staff: {
    created: () => toast.success('Staff member created successfully'),
    updated: () => toast.success('Staff member updated successfully'),
    checkedIn: () => toast.success('Staff checked in'),
    checkedOut: () => toast.success('Staff checked out'),
  },
  action: {
    export: () => toast.success('Export started'),
  },
};

export default toastHelpers;
