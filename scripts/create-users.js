const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  console.log('Usage:')
  console.log('  VITE_SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_KEY=your-service-key node create-users.js')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createUsers() {
  const users = [
    { email: 'admin@safari.com', password: 'Admin@123', role: 'Administrator', name: 'System Admin' },
    { email: 'manager@safari.com', password: 'Manager@123', role: 'Manager', name: 'Hotel Manager' },
    { email: 'staff@safari.com', password: 'Staff@123', role: 'Staff', name: 'Front Desk Staff' },
    { email: 'demo@safari.com', password: 'Demo@123', role: 'Demo', name: 'Demo User' }
  ]

  console.log('Creating users...\n')

  for (const u of users) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { role: u.role, name: u.name }
      })

      if (error) {
        if (error.message.includes('already been registered')) {
          console.log(`⚠️  Already exists: ${u.email}`)
        } else {
          console.error(`❌ Error creating ${u.email}:`, error.message)
        }
      } else {
        console.log(`✅ Created: ${u.email} (${u.role})`)
      }
    } catch (e) {
      console.error(`❌ Exception for ${u.email}:`, e.message)
    }
  }

  console.log('\nDone!')
}

createUsers()