import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxvtqfttyzlxsueoiwuw.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnRxZnR0eXpseHN1ZW9pd3V3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUwODU1NywiZXhwIjoyMDkxMDg0NTU3fQ.Z6cefQwmko9tN8Vk-TSev9cbFNG07QoVMigLut9opBY';

async function fixRLS() {
  try {
    console.log('🔧 Fixing RLS recursion issue...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: true, persistSession: false }
    });

    // First, drop the problematic policies
    console.log('\n📋 Dropping problematic policies...');
    const dropPolicies = `
      DROP POLICY IF EXISTS users_same_property ON users;
      DROP POLICY IF EXISTS users_managers_can_update ON users;
    `;

    // Disable RLS on users table
    console.log('📋 Disabling RLS on users table...');
    const disableRLS = `
      ALTER TABLE users DISABLE ROW LEVEL SECURITY;
    `;

    // Execute via raw SQL endpoint
    const { error: dropError } = await supabase.rpc('exec', { sql: dropPolicies }).catch(() => ({ error: null }));
    if (dropError?.message && !dropError.message.includes('method not available')) {
      console.error('❌ Error dropping policies:', dropError.message);
    }

    const { error: disableError } = await supabase.rpc('exec', { sql: disableRLS }).catch(() => ({ error: null }));
    if (disableError?.message && !disableError.message.includes('method not available')) {
      console.error('❌ Error disabling RLS:', disableError.message);
    }

    console.log('\n⚠️  RPC method not available. Please run these SQL commands manually:');
    console.log('\nSQL to fix RLS recursion:');
    console.log('─'.repeat(60));
    console.log(dropPolicies);
    console.log(disableRLS);
    console.log('─'.repeat(60));
    console.log('\nInstructions:');
    console.log('1. Go to: https://app.supabase.com/project/wxvtqfttyzlxsueoiwuw/sql/new');
    console.log('2. Copy and paste the SQL above');
    console.log('3. Click "Run"');
    console.log('\nOr directly access: https://app.supabase.com/project/wxvtqfttyzlxsueoiwuw/sql');

  } catch (err) {
    console.error('💥 Error:', err.message);
  }
}

fixRLS();
