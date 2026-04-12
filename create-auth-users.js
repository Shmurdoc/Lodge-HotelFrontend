import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxvtqfttyzlxsueoiwuw.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnRxZnR0eXpseHN1ZW9pd3V3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUwODU1NywiZXhwIjoyMDkxMDg0NTU3fQ.Z6cefQwmko9tN8Vk-TSev9cbFNG07QoVMigLut9opBY';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAuthUsers() {
  console.log('Creating auth users...\n');

  // Create admin user
  const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
    email: 'admin@nexusgrand.com',
    password: 'NexusAdmin2026!',
    email_confirm: true,
    user_metadata: { name: 'Admin User' }
  });

  if (adminError) {
    console.error('Admin error:', adminError.message);
  } else {
    console.log('✅ Created admin@nexusgrand.com / NexusAdmin2026!');
  }

  // Create manager user
  const { data: managerData, error: managerError } = await supabase.auth.admin.createUser({
    email: 'manager@nexusgrand.com',
    password: 'NexusManager2026!',
    email_confirm: true,
    user_metadata: { name: 'Manager User' }
  });

  if (managerError) {
    console.error('Manager error:', managerError.message);
  } else {
    console.log('✅ Created manager@nexusgrand.com / NexusManager2026!');
  }

  console.log('\nDone!');
}

createAuthUsers();