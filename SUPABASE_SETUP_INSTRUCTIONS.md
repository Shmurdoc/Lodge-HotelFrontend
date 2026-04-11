# Supabase Migration Instructions

## Current Status
❌ Database tables NOT created yet
- The `bookings`, `rooms`, `guests`, and other required tables don't exist in Supabase

## What You Need To Do

### Step 1: Apply the Database Schema
1. Go to **Supabase Dashboard**: https://app.supabase.com/project/wxvtqfttyzlxsueoiwuw/sql/new
2. Create a **New Query** (SQL Editor)
3. Open and copy the entire contents of: `supabase/migrations/001_init.sql`
4. Paste into the Supabase SQL Editor
5. Click **"Run"**
6. Wait for completion (should take 30-60 seconds)

### Step 2: Verify Tables Created
Run this query to verify all tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- properties
- users
- rooms
- bookings
- guests
- invoices
- payments
- expenses
- inventory
- tickets
- attendance
- maintenance
- amenities

### Step 3: Seed Sample Data (Optional but Recommended)
Once tables are created, run: `supabase/migrations/002_seed_data.sql` (if it exists)

OR manually insert a test property:
```sql
INSERT INTO properties (id, name, address, total_rooms, status, phone, email)
VALUES (
  gen_random_uuid(),
  'Test Property',
  '123 Hotel Street',
  50,
  'operational',
  '+1-555-0100',
  'info@testproperty.com'
);
```

### Step 4: Verify Connection
Run the test script to confirm:
```bash
npm run test:supabase
```

## Troubleshooting

If you get errors like:
- `"Could not find the table 'public.bookings'"` → Tables haven't been created yet (do Step 1)
- `"relation 'bookings' does not exist"` → Same as above
- `"permission denied"` → Check Supabase authentication token

## Next Steps After Migration
Once tables are created:
1. ✅ Run test connection: `node test-supabase-connection.js`
2. ✅ Uncomment BookingsDataContainer in `src/pages/BookingManagement.tsx`
3. ✅ Run dev server: `npm run dev`
4. ✅ Test real data loading

---

**Credentials:**
- Supabase Project ID: wxvtqfttyzlxsueoiwuw
- Anon Key: `VITE_SUPABASE_ANON_KEY` in `.env.local`
- Service Role: `VITE_SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
