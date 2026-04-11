# Data Container Integration Guide

This document maps all 24 pages to their appropriate data containers and shows integration patterns.

## Container Mapping

### 1. **BookingsDataContainer** - Pages using booking data
- ✅ `BookingManagement.tsx` - Primary booking CRUD
- ✅ `CheckInOut.tsx` - Check-in/out operations (uses bookings)
- `RateManagement.tsx` - Rate changes per booking

### 2. **RoomsDataContainer** - Pages using room data
- ✅ `Rooms.tsx` - Primary room management
- ✅ `RfidManagement.tsx` - Room RFID tags + room status
- `FacilityManagement.tsx` - Facility includes rooms

### 3. **GuestsDataContainer** - Pages using guest data
- ✅ `Guests.tsx` - Primary guest management
- `EmployeeProfiles.tsx` - Guest loyalty/VIP profiles

### 4. **EmployeesDataContainer** - Pages using employee data
- ✅ `StaffScheduling.tsx` - Staff shift management
- `EmployeeProfiles.tsx` - Employee profiles and roles
- `AdminPanel.tsx` - User/employee admin functions

### 5. **FinancialDataContainer** - Pages using invoice/payment data
- ✅ `FinancialManagement.tsx` - Invoices and payments
- `ReportsPage.tsx` - Financial reports (uses invoices)
- `Integrations.tsx` - Payment gateway integrations

### 6. **Multi-Container Pages** - Use multiple containers
- `AdminPanel.tsx` - Employees + Financial + Rooms
- `ReportsPage.tsx` - Bookings + Financial + Guests
- `Integrations.tsx` - Financial (payments) + Settings

### 7. **Generic/Support Pages** - May not need containers
- `LoginPage.tsx` - Auth only, no data container needed
- `ErrorPages.tsx` - Error handling only
- `Messaging.tsx` - Real-time messages (custom handler)
- `AIEnhancements.tsx` - AI features (no Supabase integration)
- `TicketManagement.tsx` - Tickets (separate container needed)
- `InventoryManagement.tsx` - Inventory (separate container needed)
- `Integrations.tsx` - Settings (may need generic data container)
- `Settings.tsx` - Settings only
- `ForecastingPage.tsx` - Analytics (computed data)
- `PropertyManagement.tsx` - Properties (separate container)

## Integration Pattern Template

Each page integration follows this pattern:

```typescript
// Before (Mock Data)
export default function BookingManagement() {
  const { bookings, addBooking } = useAppStore(); // Mock data
  const [items, setItems] = useState(bookings);
  // ... rest of component

// After (Real Data + RBAC)
export default function BookingManagement() {
  return (
    <BookingsDataContainer
      requiredPermission="view:bookings"
      enableRealtime={true}
      render={({ 
        bookings, 
        paginatedBookings, 
        pagination, 
        filters, 
        sorting,
        permissions,
        auth 
      }) => (
        // Component content using provided data
        <div>
          {permissions.canView && (
            // Render bookings list
          )}
        </div>
      )}
    />
  );
}
```

## Step-by-Step Integration

### Step 1: Import Container
```typescript
import { BookingsDataContainer } from '@/components/containers/BookingsDataContainer';
```

### Step 2: Wrap Component with Container
```typescript
export default function BookingManagement() {
  return (
    <BookingsDataContainer
      requiredPermission="view:bookings"
      enableRealtime={true}
      render={(props) => <BookingList {...props} />}
    />
  );
}
```

### Step 3: Extract Nested Component
```typescript
function BookingList({ 
  bookings,
  paginatedBookings,
  pagination,
  filters,
  sorting,
  permissions,
  auth 
}) {
  // Use paginatedBookings instead of bookings for display
  // Use permissions.canEdit, canDelete, etc. for UI controls
  // Use auth.propertyId for property-scoped operations
}
```

### Step 4: Use Container Helper Properties
```typescript
// Pagination example
<button onClick={() => pagination.goNext()}>Next Page</button>

// Filtering example
<input 
  onChange={(e) => filters.setFilter('status', e.target.value)}
  placeholder="Filter by status"
/>

// Sorting example
<button onClick={() => sorting.sort('checkIn')}>Sort by Check-In</button>

// Permission checks example
{permissions.canCreate && <button>New Booking</button>}
{permissions.canEdit && <EditButton />}
{permissions.canDelete && <DeleteButton />}
```

## Container Properties Reference

### All Containers Provide
```typescript
{
  // Data (varies by container)
  items: T[];                          // All raw items
  paginatedItems: T[];                 // Current page items
  filteredItems: T[];                  // Filtered items
  sortedItems: T[];                    // Sorted items

  // Pagination object
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

  // Filters object
  filters: {
    filtered: T[];
    filters: Record<string, string>;
    setFilter: (key: string, value: string) => void;
    setFilters: (filters: Record<string, string>) => void;
    clearFilters: () => void;
    hasActiveFilters: boolean;
  };

  // Sorting object
  sorting: {
    sorted: T[];
    sort: (key: keyof T) => void;
    sortKey: keyof T | null;
    sortDir: 'asc' | 'desc';
  };

  // Permissions
  permissions: {
    canView: boolean;
    canCreate?: boolean;     // Varies by container
    canEdit?: boolean;       // Varies by container
    canDelete?: boolean;     // Varies by container
    canManage?: boolean;     // For staff/financial
    userRole: string;
  };

  // Auth info
  auth: {
    propertyId: string | null;
    user: any;
    isConnected?: boolean;   // Real-time status
  };
}
```

## Priority: Quick Integration Path

**Phase 1 (CRITICAL - Do First)**: 4 pages
1. BookingManagement.tsx - Uses BookingsDataContainer
2. Rooms.tsx - Uses RoomsDataContainer
3. RfidManagement.tsx - Uses RoomsDataContainer
4. FinancialManagement.tsx - Uses FinancialDataContainer

**Phase 2 (HIGH - Supporting Pages)**: 6 pages
5. Guests.tsx - Uses GuestsDataContainer
6. StaffScheduling.tsx - Uses EmployeesDataContainer
7. CheckInOut.tsx - Uses BookingsDataContainer
8. ReportsPage.tsx - Uses multiple containers
9. AdminPanel.tsx - Uses multiple containers
10. Integrations.tsx - Uses FinancialDataContainer

**Phase 3 (MEDIUM - Remaining Pages)**: 14 pages
11-24. Other pages (TicketManagement, InventoryManagement, etc.)

## Known Limitations

1. **TicketManagement** - Needs TicketsDataContainer (not yet created)
2. **InventoryManagement** - Needs InventoryDataContainer (not yet created)
3. **PropertyManagement** - Needs PropertiesDataContainer (not yet created)
4. **Messaging** - Real-time messages (custom SignalR handler)
5. **AIEnhancements** - AI-specific, no traditional data container
6. **ForecastingPage** - Computed analytics, not direct Supabase query

## Testing Each Integration

```typescript
// Test that container loads with real data
1. Open page in browser
2. Check console for "Loading..." then data appears
3. Verify pagination controls work
4. Verify filter inputs respond
5. Verify sort buttons toggle asc/desc
6. Verify permission checks hide/show buttons based on role
7. Open DevTools > Network to see Supabase requests
8. Verify propertyId is passed in all queries
```

## Common Issues & Fixes

**Issue**: "Property 'bookings' is not available"
**Fix**: Ensure you're using `paginatedBookings` not `bookings` in the render function

**Issue**: "Pagination shows all items"
**Fix**: Ensure `enablePagination` is true and `pageSize` is set correctly

**Issue**: "Filters not working"
**Fix**: Ensure filter keys match exact property names in data structure

**Issue**: "Permissions always false"
**Fix**: Verify AuthProvider is wrapping App.tsx and user is authenticated

