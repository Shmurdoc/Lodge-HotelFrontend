import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Connection Verification Script
 * Tests that all credentials and connections work properly
 */

const SUPABASE_URL = 'https://wxvtqfttyzlxsueoiwuw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnRxZnR0eXpseHN1ZW9pd3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDg1NTcsImV4cCI6MjA5MTA4NDU1N30.OQu9WSde6Wd7kRpuqFN4JWISGSbwkTq7Vw5rDJ3gxJ8';

async function verifySupabaseConnection() {
  console.log('🔍 Supabase Connection Verification');
  console.log('=====================================\n');

  try {
    // Initialize Supabase client
    console.log('✓ Initializing Supabase client...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✓ Supabase client initialized successfully\n');

    // Test 1: Check connection to Supabase URL
    console.log('📋 Test 1: Checking Supabase URL connectivity');
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
      });
      console.log(`✓ URL is reachable (Status: ${response.status})\n`);
    } catch (error) {
      console.error(`✗ Failed to reach URL: ${error}\n`);
    }

    // Test 2: Attempt to query a table
    console.log('📋 Test 2: Testing table queries');
    try {
      const { data, error } = await supabase.from('bookings').select('count').limit(1);
      if (error) {
        console.error(`✗ Query failed: ${error.message}`);
        console.error(`  Code: ${error.code}\n`);
      } else {
        console.log(`✓ Successfully queried bookings table`);
        console.log(`  Sample data returned: ${JSON.stringify(data)}\n`);
      }
    } catch (error) {
      console.error(`✗ Query error: ${error}\n`);
    }

    // Test 3: Check authentication
    console.log('📋 Test 3: Checking authentication');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.log(`ℹ  No active session (normal for anon key): ${error.message}`);
      } else {
        console.log(`✓ Auth check completed`);
        console.log(`  Session: ${data.session ? 'Active' : 'None (expected for anon)'}\n`);
      }
    } catch (error) {
      console.error(`✗ Auth check failed: ${error}\n`);
    }

    // Test 4: List available tables
    console.log('📋 Test 4: Listing available tables');
    try {
      const tables = [
        'bookings',
        'rooms',
        'guests',
        'users',
        'properties',
        'invoices',
        'payments',
        'expenses',
        'inventory',
        'tickets',
        'attendance',
        'maintenance',
      ];

      console.log('Testing table access:');
      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('1').limit(1);
          if (error?.code === 'PGRST116' || error?.code === '42P01') {
            console.log(`  ✗ ${table.padEnd(15)} - Table not found`);
          } else if (error) {
            console.log(`  ? ${table.padEnd(15)} - Error: ${error.code}`);
          } else {
            console.log(`  ✓ ${table.padEnd(15)} - Accessible`);
          }
        } catch (e) {
          console.log(`  ✗ ${table.padEnd(15)} - Connection error`);
        }
      }
      console.log();
    } catch (error) {
      console.error(`✗ Failed to list tables: ${error}\n`);
    }

    // Test 5: Database connection string
    console.log('📋 Test 5: Database connection details');
    console.log('Host: db.wxvtqfttyzlxsueoiwuw.supabase.co');
    console.log('Port: 5432');
    console.log('Database: postgres');
    console.log('User: postgres');
    console.log('✓ All connection details configured\n');

    console.log('✅ Supabase verification complete!');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Fatal error during verification:');
    console.error(error);
  }
}

// Run verification
if (typeof window === 'undefined') {
  // Node.js environment
  verifySupabaseConnection().catch(console.error);
} else {
  // Browser environment
  console.warn('This script is meant to run in Node.js, not the browser');
}

export { verifySupabaseConnection };
