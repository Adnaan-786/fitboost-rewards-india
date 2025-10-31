import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the first user to assign reels to
    const { data: users } = await supabaseClient
      .from('profiles')
      .select('id')
      .limit(5);

    if (!users || users.length === 0) {
      throw new Error('No users found. Please create a user first.');
    }

    // Sample fitness video URLs (using public fitness content)
    const sampleReels = [
      {
        user_id: users[0].id,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        caption: '💪 Morning workout routine! Start your day strong! #FitnessMotivation #WorkoutRoutine',
        likes: 45
      },
      {
        user_id: users[Math.min(1, users.length - 1)].id,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        caption: '🏃‍♂️ Cardio session that burns! 30 minutes of pure energy! #Cardio #FitLife',
        likes: 67
      },
      {
        user_id: users[Math.min(2, users.length - 1)].id,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        caption: '🔥 HIIT workout - High intensity, high results! #HIIT #FitnessGoals',
        likes: 89
      },
      {
        user_id: users[Math.min(3, users.length - 1)].id,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        caption: '🧘‍♀️ Yoga flow for flexibility and peace ✨ #YogaLife #Wellness',
        likes: 52
      },
      {
        user_id: users[Math.min(4, users.length - 1)].id,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        caption: '💯 Strength training tips! Build muscle the right way! #StrengthTraining #GymLife',
        likes: 73
      }
    ];

    // Delete existing sample reels first
    await supabaseClient
      .from('social_reels')
      .delete()
      .in('video_url', sampleReels.map(r => r.video_url));

    // Insert sample reels
    const { data, error } = await supabaseClient
      .from('social_reels')
      .insert(sampleReels)
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully seeded ${data.length} fitness reels!`,
        reels: data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
