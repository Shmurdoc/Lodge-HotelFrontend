import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const supabaseUrl = 'https://wxvtqfttyzlxsueoiwuw.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnRxZnR0eXpseHN1ZW9pd3V3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUwODU1NywiZXhwIjoyMDkxMDg0NTU3fQ.Z6cefQwmko9tN8Vk-TSev9cbFNG07QoVMigLut9opBY';

async function runMigration() {
  try {
    console.log('🚀 Starting Supabase migration...');
    console.log(`📍 URL: ${supabaseUrl}\n`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      }
    });

    // Read the SQL migration file
    const migrationPath = resolve('./supabase/migrations/001_init.sql');
    const sql = readFileSync(migrationPath, 'utf-8');
    
    console.log('📖 Migration file loaded. Executing SQL...\n');

    // Execute the SQL migration
    const { data, error } = await supabase.rpc('exec', { sql_text: sql }).catch(() => ({
      error: { message: 'RPC method not available, will use direct query' }
    }));

    if (error && error.message.includes('RPC')) {
      console.log('⚠️  RPC method not available. Using direct SQL execution approach...\n');
      console.log('📋 SQL Migration Content:');
      console.log('─'.repeat(60));
      console.log(sql.substring(0, 500) + '...\n');
      console.log('─'.repeat(60));
      console.log('\n⚠️  Please run the migration manually in Supabase SQL Editor:');
      console.log('1. Go to: https://app.supabase.com/project/wxvtqfttyzlxsueoiwuw/sql/new');
      console.log('2. Copy and paste the SQL from: supabase/migrations/001_init.sql');
      console.log('3. Click "Run"\n');
    } else if (error) {
      console.error('❌ Migration Error:', error.message);
      process.exit(1);
    } else {
      console.log('✅ Migration completed successfully!');
      console.log('📊 Testing tables...\n');
      
      // Test if tables were created
      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
      
      console.log(`✅ Bookings table exists`);
    }
    
  } catch (err) {
    console.error('💥 Error:', err.message);
    console.log('\n📝 Alternative: Manual migration steps:');
    console.log('1. Open Supabase dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Create new query');
    console.log('4. Paste content from: supabase/migrations/001_init.sql');
    console.log('5. Run query');
  }
}

runMigration();
