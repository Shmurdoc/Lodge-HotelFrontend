import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxvtqfttyzlxsueoiwuw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnRxZnR0eXpseHN1ZW9pd3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDg1NTcsImV4cCI6MjA5MTA4NDU1N30.OQu9WSde6Wd7kRpuqFN4JWISGSbwkTq7Vw5rDJ3gxJ8';

async function testConnection() {
  try {
    console.log('🔗 Testing Supabase connection...');
    console.log(`📍 URL: ${supabaseUrl}`);
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    });

    // Test 1: Check bookings table
    console.log('\n📊 Fetching bookings...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .limit(5);

    if (bookingsError) {
      console.error('❌ Bookings Error:', bookingsError.message);
    } else {
      console.log(`✅ Bookings: Found ${bookings?.length || 0} records`);
      if (bookings && bookings.length > 0) {
        console.log(`   First booking: ${JSON.stringify(bookings[0], null, 2)}`);
      }
    }

    // Test 2: Check rooms table
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

    // Test 3: Check guests table
    console.log('\n👥 Fetching guests...');
    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('*')
      .limit(5);

    if (guestsError) {
      console.error('❌ Guests Error:', guestsError.message);
    } else {
      console.log(`✅ Guests: Found ${guests?.length || 0} records`);
    }

    console.log('\n✨ Connection test complete!');
  } catch (err) {
    console.error('💥 Fatal error:', err.message);
    process.exit(1);
  }
}

testConnection();
