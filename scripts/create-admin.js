import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_KEY - needed for admin creation')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createAdminUser() {
  const adminEmail = 'admin@safari.com'
  const adminPassword = 'Admin@123'

  // Check if user exists
  const { data: existing } = await supabase.auth.admin.listUsers()
  const exists = existing?.users.find(u => u.email === adminEmail)

  if (exists) {
    console.log('Admin user already exists:', adminEmail)
    return
  }

  // Create user
  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { role: 'Administrator', name: 'System Admin' }
  })

  if (error) {
    console.error('Error creating admin:', error.message)
    process.exit(1)
  }

  console.log('Admin user created:', data.user?.email)
}

async function createDemoUsers() {
  const users = [
    { email: 'manager@safari.com', password: 'Manager@123', role: 'Manager', name: 'Hotel Manager' },
    { email: 'staff@safari.com', password: 'Staff@123', role: 'Staff', name: 'Front Desk Staff' }
  ]

  for (const u of users) {
    const { error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { role: u.role, name: u.name }
    })
    if (error && !error.message.includes('already been registered')) {
      console.error(`Error creating ${u.email}:`, error.message)
    } else {
      console.log(`Created: ${u.email}`)
    }
  }
}

createAdminUser().then(() => createDemoUsers())