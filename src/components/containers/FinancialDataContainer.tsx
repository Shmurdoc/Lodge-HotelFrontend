import React, { type ReactNode } from 'react';
import { useAuth } from '@/lib/authContext';
import { usePermission } from '@/hooks/usePermission';
import { usePageData } from '@/hooks/usePageData';
import { useAppStore } from '@/store/useAppStore';
import { usePaginatedData, useFilteredData, useSortedData } from '@/hooks/usePageData';
import type { Invoice, Payment } from '@/store/useAppStore';

/**
 * FinancialDataContainer - Specialized container for financial management pages
 * 
 * Provides:
 * - Real invoice and payment data from Supabase
 * - RBAC permission checks for viewing/managing finances
 * - Pagination, filtering, and sorting functionality
 */

interface FinancialDataContainerProps {
  requiredPermission: string;
  dataType?: 'invoices' | 'payments' | 'all';
  enableRealtime?: boolean;
  renderLoading?: () => ReactNode;
  renderError?: (error: string) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderAccessDenied?: () => ReactNode;
  render: (props: {
    invoices: Invoice[];
    payments: Payment[];
    paginatedInvoices: Invoice[];
    paginatedPayments: Payment[];
    filteredInvoices: Invoice[];
    filteredPayments: Payment[];
    sortedInvoices: Invoice[];
    sortedPayments: Payment[];
    pagination: any;
    filters: any;
    sorting: any;
    permissions: {
      canView: boolean;
      canManage: boolean;
      canCreateInvoice: boolean;
      canCreatePayment: boolean;
      userRole: string;
    };
    auth: {
      propertyId: string | null;
      user: any;
    };
  }) => ReactNode;
}

export const FinancialDataContainer: React.FC<FinancialDataContainerProps> = ({
  requiredPermission,
  dataType,
  renderLoading,
  renderError,
  renderEmpty,
  renderAccessDenied,
  render,
}) => {
  const { propertyId, user } = useAuth();
  const { hasPermission, userRole } = usePermission();
  const { isLoading, error, hasAccess } = usePageData(requiredPermission);
  const { invoices, payments } = useAppStore();

  // Filter by property
  const propertyInvoices = propertyId
    ? invoices.filter((i) => i.propertyId === propertyId)
    : invoices;
  const propertyPayments = propertyId
    ? payments.filter((p) => p.propertyId === propertyId)
    : payments;

  // Apply filtering, sorting, and pagination for invoices
  const invoiceFilterKeys: (keyof Invoice)[] = ['status', 'bookingId'];
  const filteredInvoices = useFilteredData(propertyInvoices, invoiceFilterKeys);
  const sortedInvoices = useSortedData(filteredInvoices.filtered, 'createdAt');
  const paginationInvoices = usePaginatedData(sortedInvoices.sorted, 20);

  // Apply filtering, sorting, and pagination for payments
  const paymentFilterKeys = ['method', 'status'] as (keyof Payment)[];
  const filteredPayments = useFilteredData(propertyPayments, paymentFilterKeys);
  const sortedPayments = useSortedData(filteredPayments.filtered, 'transactionDate' as keyof Payment);
  const paginationPayments = usePaginatedData(sortedPayments.sorted, 20);

  // Check permissions
  const canViewFinances = hasPermission('view:finances');
  const canManageFinances = hasPermission('manage:finances');
  const canCreateInvoice = hasPermission('create:invoice');
  const canCreatePayment = hasPermission('create:payment');

  // Loading state
  if (isLoading) {
    return renderLoading ? renderLoading() : <div className="p-4">Loading financial data...</div>;
  }

  // Permission check
  if (!canViewFinances || !hasAccess) {
    return renderAccessDenied ? (
      renderAccessDenied()
    ) : (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-gray-400">You do not have permission to view financial data.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return renderError ? (
      renderError(error)
    ) : (
      <div className="p-4 bg-red-900 text-red-100 rounded">Error loading financial data: {error}</div>
    );
  }

  // Empty state
  const isEmpty = propertyInvoices.length === 0 && propertyPayments.length === 0;
  if (isEmpty) {
    return renderEmpty ? (
      renderEmpty()
    ) : (
      <div className="p-4 text-center text-gray-400">No financial data found</div>
    );
  }

  return (
    <>
      {render({
        invoices: propertyInvoices,
        payments: propertyPayments,
        paginatedInvoices: paginationInvoices.items,
        paginatedPayments: paginationPayments.items,
        filteredInvoices: filteredInvoices.filtered,
        filteredPayments: filteredPayments.filtered,
        sortedInvoices: sortedInvoices.sorted,
        sortedPayments: sortedPayments.sorted,
        pagination: { invoices: paginationInvoices, payments: paginationPayments },
        filters: { invoices: filteredInvoices, payments: filteredPayments },
        sorting: { invoices: sortedInvoices, payments: sortedPayments },
        permissions: {
          canView: canViewFinances,
          canManage: canManageFinances,
          canCreateInvoice,
          canCreatePayment,
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
