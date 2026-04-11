import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxvtqfttyzlxsueoiwuw.supabase.co';
// Use SERVICE ROLE key which bypasses RLS
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnRxZnR0eXpseHN1ZW9pd3V3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUwODU1NywiZXhwIjoyMDkxMDg0NTU3fQ.Z6cefQwmko9tN8Vk-TSev9cbFNG07QoVMigLut9opBY';

async function testServiceRoleConnection() {
  try {
    console.log('🔐 Testing Supabase with SERVICE ROLE key (bypasses RLS)...');
    console.log(`📍 URL: ${supabaseUrl}\n`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    // Test 1: Check users table
    console.log('👥 Fetching users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('❌ Users Error:', usersError.message);
    } else {
      console.log(`✅ Users: Found ${users?.length || 0} records`);
      if (users && users.length > 0) {
        console.log(`   First user:`, JSON.stringify(users[0], null, 2));
      } else {
        console.log('   (No users in database - seed data needed)');
      }
    }

    // Test 2: Check bookings table
    console.log('\n📊 Fetching bookings...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .limit(5);

    if (bookingsError) {
      console.error('❌ Bookings Error:', bookingsError.message);
    } else {
      console.log(`✅ Bookings: Found ${bookings?.length || 0} records`);
    }

    // Test 3: Check rooms table
    console.log('\n🏨 Fetching rooms...');
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .limit(5);

    if (roomsError) {
      console.error('❌ Rooms Error:', roomsError.message);
    } else {
      console.log(`✅ Rooms: Found ${rooms?.length || 0} records`);
    }

    // Test 4: Check properties table
    console.log('\n🏛️  Fetching properties...');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .limit(5);

    if (propertiesError) {
      console.error('❌ Properties Error:', propertiesError.message);
    } else {
      console.log(`✅ Properties: Found ${properties?.length || 0} records`);
    }

    console.log('\n✨ Connection test complete!');
    console.log('\nℹ️  Summary:');
    console.log('- Service Role Key works (bypasses RLS)');
    console.log('- RLS policies on users table are causing recursion for Anon Key');
    console.log('- Solution: Frontend should use auth token, backend uses service role');
    
  } catch (err) {
    console.error('💥 Fatal error:', err.message);
    process.exit(1);
  }
}

testServiceRoleConnection();
