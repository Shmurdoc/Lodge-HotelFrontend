import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxvtqfttyzlxsueoiwuw.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnRxZnR0eXpseHN1ZW9pd3V3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUwODU1NywiZXhwIjoyMDkxMDg0NTU3fQ.Z6cefQwmko9tN8Vk-TSev9cbFNG07QoVMigLut9opBY';

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...\n');
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: true, persistSession: false }
    });

    // Get table structure info - try to insert empty and check error details
    console.log('📋 Attempting to get properties table columns...');
    const { error } = await supabase
      .from('properties')
      .insert({ name: 'test' })
      .select();
    
    if (error) {
      console.log('Error message:', error.message);
      console.log('Error details:', error);
    }

    // Try querying with wildcard
    console.log('\n📋 Querying properties table...');
    const { data, error: queryError } = await supabase
      .from('properties')
      .select('*')
      .limit(1);
    
    if (queryError) {
      console.log('Query Error:', queryError.message);
    } else if (data && data.length > 0) {
      console.log('Sample property:', JSON.stringify(data[0], null, 2));
    } else {
      console.log('No properties found (empty table)');
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkSchema();
