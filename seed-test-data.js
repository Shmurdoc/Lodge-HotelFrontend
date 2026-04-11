import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://wxvtqfttyzlxsueoiwuw.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnRxZnR0eXpseHN1ZW9pd3V3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUwODU1NywiZXhwIjoyMDkxMDg0NTU3fQ.Z6cefQwmko9tN8Vk-TSev9cbFNG07QoVMigLut9opBY';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: true, persistSession: false }
    });

    // Create test property
    console.log('\n📍 Creating test property...');
    const propertyId = crypto.randomUUID();
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        id: propertyId,
        name: 'Nexus Grand Hotel',
        address: '123 Main Street, Cape Town, South Africa',
        total_rooms: 150,
        occupied_rooms: 5,
        rating: 4.5,
        status: 'operational',
        phone: '+27-21-555-0001',
        email: 'info@nexusgrand.com',
        check_in_time: '14:00',
        check_out_time: '11:00'
      })
      .select();

    if (propertyError) {
      console.error('❌ Property Error:', propertyError.message);
      throw propertyError;
    }
    console.log(`✅ Property created: ${property[0]?.name}`);

    // Create test users
    console.log('\n👥 Creating test users...');
    const adminUserId = crypto.randomUUID();
    const managerUserId = crypto.randomUUID();
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert([
        {
          id: adminUserId,
          property_id: propertyId,
          name: 'Admin User',
          email: 'admin@nexusgrand.com',
          role: 'Administrator',
          department: 'Management',
          phone: '+27-21-555-0002',
          hire_date: '2020-01-01',
          status: 'active'
        },
        {
          id: managerUserId,
          property_id: propertyId,
          name: 'Manager User',
          email: 'manager@nexusgrand.com',
          role: 'Manager',
          department: 'Operations',
          phone: '+27-21-555-0003',
          hire_date: '2021-03-15',
          status: 'active'
        }
      ])
      .select();

    if (usersError) {
      console.error('❌ Users Error:', usersError.message);
      throw usersError;
    }
    console.log(`✅ ${users?.length || 0} users created`);

    // Create test rooms
    console.log('\n🏨 Creating test rooms...');
    const rooms = [];
    for (let i = 1; i <= 10; i++) {
      rooms.push({
        id: crypto.randomUUID(),
        property_id: propertyId,
        number: `${String(i).padStart(3, '0')}`,
        type: ['Standard Room', 'Deluxe Room', 'Suite'][i % 3],
        floor: Math.ceil(i / 5),
        status: ['available', 'occupied', 'cleaning'][i % 3],
        price: 1500 + (i * 200),
        max_occupancy: i % 3 === 0 ? 2 : 1,
        amenities: ['WiFi', 'TV', 'AC', 'Mini Bar']
      });
    }

    const { data: createdRooms, error: roomsError } = await supabase
      .from('rooms')
      .insert(rooms)
      .select();

    if (roomsError) {
      console.error('❌ Rooms Error:', roomsError.message);
      throw roomsError;
    }
    console.log(`✅ ${createdRooms?.length || 0} rooms created`);

    // Create test guests
    console.log('\n👤 Creating test guests...');
    const guests = [];
    const guestNames = ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Emma Davis'];
    for (let i = 0; i < guestNames.length; i++) {
      guests.push({
        id: crypto.randomUUID(),
        property_id: propertyId,
        name: guestNames[i],
        email: `guest${i + 1}@example.com`,
        phone: `+27-21-555-${1000 + i}`,
        id_number: `ID${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
        nationality: 'South African',
        segment: 'VIP',
        total_stays: i + 1,
        loyalty_points: (i + 1) * 100
      });
    }

    const { data: createdGuests, error: guestsError } = await supabase
      .from('guests')
      .insert(guests)
      .select();

    if (guestsError) {
      console.error('❌ Guests Error:', guestsError.message);
      throw guestsError;
    }
    console.log(`✅ ${createdGuests?.length || 0} guests created`);

    // Create test bookings
    console.log('\n📅 Creating test bookings...');
    const bookings = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const checkIn = new Date(today);
      checkIn.setDate(checkIn.getDate() + i);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 2);

      bookings.push({
        id: crypto.randomUUID(),
        property_id: propertyId,
        guest_id: createdGuests[i % createdGuests.length]?.id,
        room_id: createdRooms[i % createdRooms.length]?.id,
        guest_name: createdGuests[i % createdGuests.length]?.name || 'Guest',
        guest_email: createdGuests[i % createdGuests.length]?.email || 'guest@example.com',
        room_number: createdRooms[i % createdRooms.length]?.number || '001',
        room_type: createdRooms[i % createdRooms.length]?.type || 'Standard Room',
        check_in: checkIn.toISOString(),
        check_out: checkOut.toISOString(),
        nights: 2,
        num_guests: 1,
        adults: 1,
        status: i === 0 ? 'checked-in' : (i === 1 ? 'pending' : 'confirmed'),
        payment_status: 'paid',
        amount: 3000,
        rate_per_night: 1500,
        source: 'Online'
      });
    }

    const { data: createdBookings, error: bookingsError } = await supabase
      .from('bookings')
      .insert(bookings)
      .select();

    if (bookingsError) {
      console.error('❌ Bookings Error:', bookingsError.message);
      throw bookingsError;
    }
    console.log(`✅ ${createdBookings?.length || 0} bookings created`);

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Properties: 1`);
    console.log(`- Users: ${users?.length || 0}`);
    console.log(`- Rooms: ${createdRooms?.length || 0}`);
    console.log(`- Guests: ${createdGuests?.length || 0}`);
    console.log(`- Bookings: ${createdBookings?.length || 0}`);

  } catch (err) {
    console.error('💥 Seeding Error:', err.message);
    process.exit(1);
  }
}

seedDatabase();
