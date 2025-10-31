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

    console.log('Starting to seed workout data...');

    // Insert sample exercises
    const exercises = [
      // Chest exercises
      { name: 'Push-ups', description: 'Classic bodyweight chest exercise', muscle_group: 'chest', equipment: 'bodyweight', type: 'strength', instructions: 'Start in plank position, lower your body until chest nearly touches floor, push back up. Keep core tight and back straight.', calories_per_minute: 8 },
      { name: 'Bench Press', description: 'Fundamental chest building exercise', muscle_group: 'chest', equipment: 'barbell', type: 'strength', instructions: 'Lie on bench, grip barbell slightly wider than shoulders, lower to chest, press back up explosively.', calories_per_minute: 6 },
      { name: 'Dumbbell Flyes', description: 'Chest isolation exercise', muscle_group: 'chest', equipment: 'dumbbells', type: 'strength', instructions: 'Lie on bench with dumbbells above chest, lower arms in wide arc until stretch felt, bring back together.', calories_per_minute: 5 },
      
      // Back exercises
      { name: 'Pull-ups', description: 'Upper back and lat developer', muscle_group: 'back', equipment: 'bodyweight', type: 'strength', instructions: 'Hang from bar with overhand grip, pull yourself up until chin over bar, lower with control.', calories_per_minute: 9 },
      { name: 'Deadlift', description: 'Total back and posterior chain builder', muscle_group: 'back', equipment: 'barbell', type: 'strength', instructions: 'Stand with bar over mid-foot, bend to grip bar, keep back straight, drive through heels to stand up.', calories_per_minute: 7 },
      { name: 'Dumbbell Rows', description: 'Mid-back thickness builder', muscle_group: 'back', equipment: 'dumbbells', type: 'strength', instructions: 'Hinge at hips with dumbbells, pull weights to sides of torso, squeeze shoulder blades together.', calories_per_minute: 6 },
      
      // Leg exercises
      { name: 'Squats', description: 'King of leg exercises', muscle_group: 'legs', equipment: 'bodyweight', type: 'strength', instructions: 'Stand with feet shoulder-width, lower hips back and down, keep knees tracking over toes, drive back up.', calories_per_minute: 8 },
      { name: 'Lunges', description: 'Single leg strength and balance', muscle_group: 'legs', equipment: 'bodyweight', type: 'strength', instructions: 'Step forward, lower back knee toward ground, push through front heel to return to start.', calories_per_minute: 7 },
      { name: 'Leg Press', description: 'Quad and glute builder', muscle_group: 'legs', equipment: 'machine', type: 'strength', instructions: 'Sit in machine, place feet on platform, lower weight by bending knees, press back to start.', calories_per_minute: 6 },
      
      // Shoulder exercises
      { name: 'Shoulder Press', description: 'Overhead pressing power', muscle_group: 'shoulders', equipment: 'dumbbells', type: 'strength', instructions: 'Start with dumbbells at shoulder height, press overhead until arms fully extended, lower with control.', calories_per_minute: 6 },
      { name: 'Lateral Raises', description: 'Side delt isolation', muscle_group: 'shoulders', equipment: 'dumbbells', type: 'strength', instructions: 'Stand with dumbbells at sides, raise arms out to sides until parallel with floor, lower slowly.', calories_per_minute: 5 },
      
      // Arms exercises
      { name: 'Bicep Curls', description: 'Classic arm builder', muscle_group: 'arms', equipment: 'dumbbells', type: 'strength', instructions: 'Hold dumbbells at sides, curl up by bending elbows, squeeze biceps at top, lower slowly.', calories_per_minute: 4 },
      { name: 'Tricep Dips', description: 'Bodyweight tricep developer', muscle_group: 'arms', equipment: 'bodyweight', type: 'strength', instructions: 'Support yourself on parallel bars or bench, lower body by bending elbows, press back up.', calories_per_minute: 7 },
      
      // Core exercises
      { name: 'Plank', description: 'Core stability foundation', muscle_group: 'core', equipment: 'bodyweight', type: 'strength', instructions: 'Hold pushup position on forearms, keep body straight from head to heels, engage core.', calories_per_minute: 5 },
      { name: 'Crunches', description: 'Upper ab developer', muscle_group: 'core', equipment: 'bodyweight', type: 'strength', instructions: 'Lie on back with knees bent, lift shoulders off ground by contracting abs, lower slowly.', calories_per_minute: 4 },
      { name: 'Russian Twists', description: 'Oblique strengthener', muscle_group: 'core', equipment: 'bodyweight', type: 'strength', instructions: 'Sit with feet off ground, twist torso side to side, keep core engaged throughout.', calories_per_minute: 6 },
      
      // Cardio exercises
      { name: 'Running', description: 'Classic cardiovascular exercise', muscle_group: 'cardio', equipment: 'treadmill', type: 'cardio', instructions: 'Maintain steady pace, land midfoot, keep shoulders relaxed, breathe rhythmically.', calories_per_minute: 10 },
      { name: 'Cycling', description: 'Low-impact cardio', muscle_group: 'cardio', equipment: 'bike', type: 'cardio', instructions: 'Adjust seat height properly, maintain steady cadence, vary resistance for intensity.', calories_per_minute: 8 },
      { name: 'Jumping Jacks', description: 'Full body cardio warmup', muscle_group: 'cardio', equipment: 'bodyweight', type: 'cardio', instructions: 'Jump while spreading legs and raising arms overhead, return to start, maintain rhythm.', calories_per_minute: 9 },
      { name: 'Burpees', description: 'High intensity full body', muscle_group: 'full_body', equipment: 'bodyweight', type: 'cardio', instructions: 'Drop to pushup, perform pushup, jump feet to hands, jump up explosively.', calories_per_minute: 12 },
      
      // Flexibility
      { name: 'Yoga Flow', description: 'Full body flexibility', muscle_group: 'full_body', equipment: 'bodyweight', type: 'flexibility', instructions: 'Move through various poses focusing on breath and stretching major muscle groups.', calories_per_minute: 3 },
    ];

    const { data: exercisesData, error: exercisesError } = await supabaseClient
      .from('exercises')
      .insert(exercises)
      .select();

    if (exercisesError) {
      console.error('Error inserting exercises:', exercisesError);
      throw exercisesError;
    }

    console.log(`Inserted ${exercisesData.length} exercises`);

    // Insert sample workout plans
    const workoutPlans = [
      { name: 'Beginner Full Body', description: 'Perfect starting point for fitness beginners. Build strength and endurance with foundational movements.', difficulty_level: 'beginner', duration_weeks: 4, estimated_duration_minutes: 30, is_featured: true },
      { name: '30-Day HIIT Challenge', description: 'High intensity interval training to burn fat and build cardiovascular fitness.', difficulty_level: 'intermediate', duration_weeks: 4, estimated_duration_minutes: 25, is_featured: true },
      { name: 'Home Abs Workout', description: 'Sculpt your core with bodyweight exercises you can do anywhere.', difficulty_level: 'beginner', duration_weeks: 2, estimated_duration_minutes: 20, is_featured: false },
      { name: 'Upper Body Strength', description: 'Build chest, back, shoulders and arms with targeted exercises.', difficulty_level: 'intermediate', duration_weeks: 6, estimated_duration_minutes: 45, is_featured: false },
      { name: 'Lower Body Power', description: 'Develop strong, powerful legs and glutes.', difficulty_level: 'intermediate', duration_weeks: 6, estimated_duration_minutes: 40, is_featured: false },
      { name: 'Advanced Athlete Training', description: 'Intense full-body workouts for experienced fitness enthusiasts.', difficulty_level: 'advanced', duration_weeks: 8, estimated_duration_minutes: 60, is_featured: true },
    ];

    const { data: plansData, error: plansError } = await supabaseClient
      .from('workout_plans')
      .insert(workoutPlans)
      .select();

    if (plansError) {
      console.error('Error inserting workout plans:', plansError);
      throw plansError;
    }

    console.log(`Inserted ${plansData.length} workout plans`);

    // Link exercises to workout plans
    if (plansData && exercisesData) {
      const planExercises = [];
      
      // Beginner Full Body - mix of bodyweight exercises
      const beginnerPlan = plansData.find(p => p.name === 'Beginner Full Body');
      const pushups = exercisesData.find(e => e.name === 'Push-ups');
      const squats = exercisesData.find(e => e.name === 'Squats');
      const plank = exercisesData.find(e => e.name === 'Plank');
      
      if (beginnerPlan && pushups && squats && plank) {
        planExercises.push(
          { workout_plan_id: beginnerPlan.id, exercise_id: pushups.id, order_index: 1, sets: 3, reps: 10, rest_seconds: 60 },
          { workout_plan_id: beginnerPlan.id, exercise_id: squats.id, order_index: 2, sets: 3, reps: 15, rest_seconds: 60 },
          { workout_plan_id: beginnerPlan.id, exercise_id: plank.id, order_index: 3, sets: 3, duration_seconds: 30, rest_seconds: 60 }
        );
      }

      // HIIT Challenge
      const hiitPlan = plansData.find(p => p.name === '30-Day HIIT Challenge');
      const burpees = exercisesData.find(e => e.name === 'Burpees');
      const jumpingJacks = exercisesData.find(e => e.name === 'Jumping Jacks');
      
      if (hiitPlan && burpees && jumpingJacks) {
        planExercises.push(
          { workout_plan_id: hiitPlan.id, exercise_id: burpees.id, order_index: 1, sets: 4, reps: 15, rest_seconds: 30 },
          { workout_plan_id: hiitPlan.id, exercise_id: jumpingJacks.id, order_index: 2, sets: 4, duration_seconds: 45, rest_seconds: 30 }
        );
      }

      if (planExercises.length > 0) {
        const { error: linkError } = await supabaseClient
          .from('workout_plan_exercises')
          .insert(planExercises);

        if (linkError) {
          console.error('Error linking exercises to plans:', linkError);
        } else {
          console.log(`Linked ${planExercises.length} exercises to workout plans`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sample workout data seeded successfully',
        counts: {
          exercises: exercisesData.length,
          plans: plansData.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
