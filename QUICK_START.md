# 🚀 QUICK START - Data Container Integration (1-Minute Overview)

## What You Got

5 reusable data containers that wrap pages with real Supabase data + RBAC permissions + pagination/filtering/sorting.

## Quick Usage

```typescript
// Import
import { BookingsDataContainer } from '@/components/containers/BookingsDataContainer';

// Wrap your page
export default function MyBookingPage() {
  return (
    <BookingsDataContainer
      requiredPermission="view:bookings"
      enableRealtime={true}
      render={(props) => (
        <div>
          {/* Use props.bookings, props.paginatedBookings, etc. */}
          {props.permissions.canEdit && <EditButton />}
          <button onClick={() => props.pagination.goNext()}>Next</button>
          <input 
            onChange={(e) => props.filters.setFilter('status', e.target.value)}
            placeholder="Filter by status"
          />
        </div>
      )}
    />
  );
}
```

## What Props You Get

```typescript
{
  // Data arrays
  bookings: Booking[];              // All bookings
  paginatedBookings: Booking[];     // Current page only
  filteredBookings: Booking[];      // After filtering
  sortedBookings: Booking[];        // After sorting

  // Pagination
  pagination.page: number;
  pagination.totalPages: number;
  pagination.goNext(): void;
  pagination.goPrev(): void;
  pagination.goToPage(num): void;

  // Filtering
  filters.setFilter(key, value): void;
  filters.clearFilters(): void;
  filters.hasActiveFilters: boolean;

  // Sorting
  sorting.sort(columnKey): void;
  sorting.sortDir: 'asc' | 'desc';

  // Permissions
  permissions.canView: boolean;
  permissions.canEdit: boolean;
  permissions.canCreate: boolean;
  permissions.canDelete: boolean;

  // Auth info
  auth.propertyId: string | null;
  auth.user: CurrentUser;
}
```

## Available Containers

| Container | Data Type | Pagination | Entity-Specific |
|-----------|-----------|------------|-----------------|
| BookingsDataContainer | Booking[] | 10/page | ✅ Booking-specific filters |
| RoomsDataContainer | Room[] | 20/page | ✅ Room-specific filters |
| GuestsDataContainer | Guest[] | 20/page | ✅ Guest-specific filters |
| EmployeesDataContainer | User[] | 20/page | ✅ Staff-specific filters |
| FinancialDataContainer | Invoice[] + Payment[] | Separate pagination | ✅ Dual entity support |

## Which Container for Which Page

```
Phase 1 (Critical - Do First)
├─ BookingManagement → BookingsDataContainer
├─ Rooms → RoomsDataContainer
├─ RfidManagement → RoomsDataContainer
└─ FinancialManagement → FinancialDataContainer

Phase 2 (Supporting - Do Next)
├─ Guests → GuestsDataContainer
├─ StaffScheduling → EmployeesDataContainer
├─ CheckInOut → BookingsDataContainer
├─ AdminPanel → Multiple containers
├─ ReportsPage → Multiple containers
└─ Integrations → FinancialDataContainer

Phase 3 (Remaining - Lower Priority)
├─ TicketManagement → TicketsDataContainer (to create)
├─ InventoryManagement → InventoryDataContainer (to create)
├─ PropertyManagement → PropertiesDataContainer (to create)
└─ [11 more pages]
```

## Step-by-Step Integration

1. **Open a page** (e.g., `src/pages/Rooms.tsx`)

2. **Add import**:
   ```typescript
   import { RoomsDataContainer } from '@/components/containers/RoomsDataContainer';
   ```

3. **Find the export**:
   ```typescript
   export default function Rooms() {
     // old code...
   }
   ```

4. **Wrap with container**:
   ```typescript
   export default function Rooms() {
     return (
       <RoomsDataContainer
         requiredPermission="view:rooms"
         enableRealtime={true}
         render={(props) => <RoomsContent {...props} />}
       />
     );
   }
   
   function RoomsContent(props) {
     // OLD: const [rooms, setRooms] = useState([]);
     // NEW: Use props.paginatedRooms from container
     return (
       <div>
         {/* render using props.rooms, props.pagination, etc. */}
       </div>
     );
   }
   ```

5. **Test**:
   - Open page in browser
   - Should see real Supabase data (not mock)
   - Pagination should work
   - Filters should work
   - Check browser console - no errors

## Key Features

✅ Real Supabase data (not mock)  
✅ Multi-tenant property scoping  
✅ RBAC permission enforcement  
✅ Pagination, filtering, sorting built-in  
✅ Real-time updates (SignalR ready)  
✅ 100% TypeScript typed  
✅ Error/loading/empty states handled  

## Documentation

- **Full Guide**: `CONTAINER_INTEGRATION_GUIDE.md`
- **Status Report**: `PHASE4_INTEGRATION_STATUS.md`
- **Completion Summary**: `COMPLETION_SUMMARY.md`

## Estimated Time per Page

- Phase 1 pages: 15-20 min each
- Phase 2 pages: 10-15 min each
- Phase 3 pages: 5-10 min each

**Total**: 5-7 hours for all 24 pages

## Common Questions

**Q: Do I have to refactor the entire page?**  
A: No! Just wrap the export with the container. The inner logic stays the same.

**Q: Will this break existing functionality?**  
A: No! Containers are additive. Old code continues to work until you swap in the container props.

**Q: How do I test if it's working?**  
A: Open DevTools > Network tab. Should see Supabase requests. Check that data comes from DB, not mock.

**Q: What if my page uses multiple entity types?**  
A: Use multiple containers or check `AdminPanel.tsx` example for composition patterns.

**Q: Can I customize the pagination size?**  
A: Yes! Each container's `usePaginatedData` call sets page size - modify in container or add as prop.

## Next Steps

1. Read `CONTAINER_INTEGRATION_GUIDE.md` for detailed instructions
2. Uncomment wrapper in `BookingManagement.tsx` and test
3. Follow Phase 1 → Phase 2 → Phase 3 order
4. Use this quick reference as checklist

---

**Ready to integrate?** Start with `CONTAINER_INTEGRATION_GUIDE.md` 📖
