import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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

    console.log('Starting to cleanup duplicate exercises...');

    // Delete duplicates, keeping only the oldest entry for each exercise name
    const { error: deleteError } = await supabaseClient.rpc('exec_sql', {
      sql: `
        DELETE FROM exercises
        WHERE id NOT IN (
          SELECT MIN(id)
          FROM exercises
          GROUP BY name
        )
      `
    });

    if (deleteError) {
      // If RPC doesn't exist, use a different approach
      console.log('Using alternative cleanup method...');
      
      // Get all exercises
      const { data: allExercises, error: fetchError } = await supabaseClient
        .from('exercises')
        .select('id, name, created_at')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Find duplicates to delete (keep the first/oldest of each name)
      const seen = new Set<string>();
      const toDelete: string[] = [];

      for (const exercise of allExercises || []) {
        if (seen.has(exercise.name)) {
          toDelete.push(exercise.id);
        } else {
          seen.add(exercise.name);
        }
      }

      console.log(`Found ${toDelete.length} duplicate exercises to delete`);

      if (toDelete.length > 0) {
        const { error: deleteErr } = await supabaseClient
          .from('exercises')
          .delete()
          .in('id', toDelete);

        if (deleteErr) throw deleteErr;
      }
    }

    // Get final count
    const { count } = await supabaseClient
      .from('exercises')
      .select('*', { count: 'exact', head: true });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Duplicate exercises removed successfully',
        remaining_exercises: count
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error cleaning up exercises:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
