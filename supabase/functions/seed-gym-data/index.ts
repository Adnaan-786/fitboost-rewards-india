import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if gyms already exist
    const { data: existingGyms } = await supabaseClient
      .from('gyms')
      .select('id')
      .limit(1);

    if (existingGyms && existingGyms.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Gym data already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Seed gym data
    const gyms = [
      {
        name: 'PowerFit Gym',
        address: '123 Main St, Downtown',
        latitude: 40.7128,
        longitude: -74.0060,
        description: 'State-of-the-art equipment with certified trainers available 24/7',
        rating: 4.8,
        price_range: '$$',
        amenities: ['Free Weights', 'Cardio Machines', 'Personal Training', 'Locker Rooms', 'Sauna', '24/7 Access']
      },
      {
        name: 'Elite Fitness Center',
        address: '456 Oak Avenue, Midtown',
        latitude: 40.7580,
        longitude: -73.9855,
        description: 'Premium fitness center with Olympic-sized pool and group classes',
        rating: 4.9,
        price_range: '$$$',
        amenities: ['Swimming Pool', 'Group Classes', 'Yoga Studio', 'Spa', 'Cafe', 'Personal Training']
      },
      {
        name: 'Community Wellness Gym',
        address: '789 Park Road, Eastside',
        latitude: 40.7489,
        longitude: -73.9680,
        description: 'Affordable gym for the whole community with friendly atmosphere',
        rating: 4.3,
        price_range: '$',
        amenities: ['Basic Equipment', 'Group Classes', 'Locker Rooms', 'Parking']
      },
      {
        name: 'CrossFit Warriors',
        address: '321 Industrial Blvd, Warehouse District',
        latitude: 40.7282,
        longitude: -73.9942,
        description: 'High-intensity CrossFit training with experienced coaches',
        rating: 4.7,
        price_range: '$$',
        amenities: ['CrossFit Equipment', 'Olympic Lifting', 'Group Classes', 'Nutrition Coaching', 'Showers']
      },
      {
        name: 'Yoga & Wellness Studio',
        address: '555 Zen Street, Uptown',
        latitude: 40.7794,
        longitude: -73.9632,
        description: 'Peaceful studio focusing on yoga, meditation, and holistic wellness',
        rating: 4.6,
        price_range: '$$',
        amenities: ['Yoga Classes', 'Meditation Room', 'Pilates', 'Massage Therapy', 'Juice Bar']
      },
      {
        name: 'Iron Temple Gym',
        address: '888 Muscle Ave, Industrial Park',
        latitude: 40.7061,
        longitude: -74.0087,
        description: 'Hardcore bodybuilding gym with heavy equipment and serious atmosphere',
        rating: 4.5,
        price_range: '$',
        amenities: ['Heavy Weights', 'Power Racks', 'Cable Machines', 'Cardio', 'Supplement Store']
      },
      {
        name: 'FitLife Express',
        address: '222 Quick Street, Business District',
        latitude: 40.7549,
        longitude: -73.9840,
        description: 'Express workouts for busy professionals, 30-minute circuit training',
        rating: 4.4,
        price_range: '$$',
        amenities: ['Circuit Training', 'Express Classes', 'Locker Rooms', 'Showers', 'WiFi']
      },
      {
        name: 'Aquatic Sports Complex',
        address: '999 Water Lane, Riverside',
        latitude: 40.7358,
        longitude: -74.0036,
        description: 'Premier aquatic facility with multiple pools and water fitness programs',
        rating: 4.8,
        price_range: '$$$',
        amenities: ['Olympic Pool', 'Diving Pool', 'Water Aerobics', 'Swim Lessons', 'Hot Tub', 'Steam Room']
      }
    ];

    const { error } = await supabaseClient
      .from('gyms')
      .insert(gyms);

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: 'Gym data seeded successfully', count: gyms.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error seeding gym data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
