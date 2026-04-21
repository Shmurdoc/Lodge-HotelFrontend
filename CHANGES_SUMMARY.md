# Frontend Changes Summary

## Date: 2026-04-21

## Architectural Fix: Frontend Now Routes Through ASP.NET API

### Problem
The frontend was previously bypassing the ASP.NET backend API and calling Supabase tables directly:
```typescript
// BEFORE (incorrect architecture)
supabase.from('users').select()
supabase.from('bookings').select()
```

### Solution
Frontend now routes all data access through the ASP.NET backend API:
```typescript
// AFTER (correct architecture)
fetchApi('/api/staff')
fetchApi('/api/bookings')
```

## Changes Made

### 1. `src/lib/supabaseService.ts`
- Complete rewrite to use `fetchApi` from `backendApi.ts`
- All services now call ASP.NET API endpoints instead of Supabase directly
- Added demo data fallbacks for development

### 2. `src/lib/backendApi.ts`
- Added `fetchApi` export function
- Handles JWT token from Supabase auth
- Sends Authorization headers to backend

### 3. `.env.example`
- Added `VITE_SUPABASE_URL` - Supabase project URL
- Added `VITE_SUPABASE_ANON_KEY` - Supabase anon key (for auth only)
- Added `VITE_API_URL` - ASP.NET backend URL

### 4. `.env` (local)
- Contains actual Supabase credentials
- Points to localhost:7001 for local development

### 5. `Dockerfile`
- Added nginx-based production Dockerfile
- Multi-stage build for optimization

### 6. `.github/workflows/ci.yml`
- GitHub Actions CI workflow for automated testing

## API Endpoints Used

| Service | Endpoint |
|---------|----------|
| Users | `/api/staff` |
| Bookings | `/api/bookings` |
| Guests | `/api/guests` |
| Rooms | `/api/rooms` |
| Properties | `/api/properties` |
| Invoices | `/api/invoices` |
| Payments | `/api/payments` |
| Expenses | `/api/expenses` |
| Inventory | `/api/inventory` |
| Tickets | `/api/tickets` |
| Attendance | `/api/attendance` |
| Maintenance | `/api/maintenance` |

## Environment Variables

### Required for Production
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon/public key
- `VITE_API_URL` - Deployed ASP.NET backend URL

## Security
- API keys stored in `.env` (not committed)
- Supabase auth tokens forwarded to backend
- No direct database access from frontend

## Deployment Notes
1. Set `VITE_API_URL` in Vercel to deployed backend
2. Ensure Supabase auth is configured
3. Backend must be deployed and accessible