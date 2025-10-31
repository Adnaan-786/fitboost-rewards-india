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

    // Get user ID from request
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if user already has a membership
    const { data: existingMembership } = await supabaseClient
      .from('gym_memberships')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (existingMembership) {
      return new Response(
        JSON.stringify({ message: 'User already has a membership' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get first gym
    const { data: gym } = await supabaseClient
      .from('gyms')
      .select('id')
      .limit(1)
      .single();

    if (!gym) {
      throw new Error('No gyms available. Please seed gym data first.');
    }

    // Create membership
    const membershipId = crypto.randomUUID();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 12); // 1 year membership

    const { data: membership, error: membershipError } = await supabaseClient
      .from('gym_memberships')
      .insert({
        id: membershipId,
        user_id: user.id,
        gym_id: gym.id,
        plan_type: 'Premium Annual',
        status: 'active',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        monthly_price: 49.99,
        qr_code: `MEMBERSHIP-${user.id}-${membershipId}`
      })
      .select()
      .single();

    if (membershipError) throw membershipError;

    // Create initial payment
    const { error: paymentError } = await supabaseClient
      .from('gym_payments')
      .insert({
        user_id: user.id,
        gym_id: gym.id,
        membership_id: membershipId,
        amount: 599.88, // Annual payment
        payment_date: startDate.toISOString(),
        status: 'completed',
        payment_method: 'Credit Card',
        transaction_id: `TXN-${Date.now()}`
      });

    if (paymentError) throw paymentError;

    // Create some sample check-ins
    const checkIns = [];
    for (let i = 0; i < 5; i++) {
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() - i * 2);
      checkIns.push({
        user_id: user.id,
        gym_id: gym.id,
        membership_id: membershipId,
        check_in_time: checkInDate.toISOString()
      });
    }

    const { error: checkInsError } = await supabaseClient
      .from('gym_check_ins')
      .insert(checkIns);

    if (checkInsError) throw checkInsError;

    return new Response(
      JSON.stringify({ 
        message: 'Membership data seeded successfully',
        membership: membership
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error seeding membership data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
