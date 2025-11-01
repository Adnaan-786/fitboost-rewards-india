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

    // Check if data already exists
    const { data: existingExercises } = await supabaseClient
      .from('exercises')
      .select('id')
      .limit(1);

    if (existingExercises && existingExercises.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Workout data already exists. To reseed, please clear the exercises table first.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Insert sample exercises
    const exercises = [
      // Chest exercises
      { name: 'Push-ups', description: 'Classic bodyweight chest exercise', muscle_group: 'chest', equipment: 'bodyweight', type: 'strength', instructions: '1. Start in a plank position with hands slightly wider than shoulder-width apart.\n2. Keep your body in a straight line from head to heels.\n3. Lower your body until your chest nearly touches the floor.\n4. Push yourself back up to the starting position.\n5. Repeat for desired reps.', image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80', video_url: null, calories_per_minute: 8 },
      { name: 'Bench Press', description: 'Fundamental chest building exercise', muscle_group: 'chest', equipment: 'barbell', type: 'strength', instructions: '1. Lie flat on a bench with feet firmly on the floor.\n2. Grip the barbell slightly wider than shoulder width.\n3. Lower the bar to your chest with control.\n4. Press the bar back up explosively.\n5. Lock out at the top without overextending.', image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', video_url: null, calories_per_minute: 6 },
      { name: 'Dumbbell Flyes', description: 'Chest isolation exercise', muscle_group: 'chest', equipment: 'dumbbells', type: 'strength', instructions: '1. Lie on bench with dumbbells held above chest.\n2. Keep a slight bend in your elbows.\n3. Lower arms in wide arc until stretch felt in chest.\n4. Bring weights back together above chest.\n5. Squeeze chest at the top.', image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80', video_url: null, calories_per_minute: 5 },
      
      // Back exercises
      { name: 'Pull-ups', description: 'Upper back and lat developer', muscle_group: 'back', equipment: 'bodyweight', type: 'strength', instructions: '1. Hang from bar with overhand grip, hands shoulder-width.\n2. Engage your core and pull shoulder blades down.\n3. Pull yourself up until chin clears the bar.\n4. Lower with control to full extension.\n5. Avoid swinging or using momentum.', image_url: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&q=80', video_url: null, calories_per_minute: 9 },
      { name: 'Deadlift', description: 'Total back and posterior chain builder', muscle_group: 'back', equipment: 'barbell', type: 'strength', instructions: '1. Stand with bar over mid-foot, feet hip-width apart.\n2. Bend at hips and knees to grip the bar.\n3. Keep back straight and chest up.\n4. Drive through heels to stand up fully.\n5. Lower the bar back down with control.', image_url: 'https://images.unsplash.com/photo-1534368420009-621bfab424a8?w=800&q=80', video_url: null, calories_per_minute: 7 },
      { name: 'Dumbbell Rows', description: 'Mid-back thickness builder', muscle_group: 'back', equipment: 'dumbbells', type: 'strength', instructions: '1. Hinge at hips with dumbbell in one hand.\n2. Brace core and keep back flat.\n3. Pull weight to side of torso.\n4. Squeeze shoulder blade at top.\n5. Lower with control and repeat.', image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80', video_url: null, calories_per_minute: 6 },
      
      // Leg exercises
      { name: 'Squats', description: 'King of leg exercises', muscle_group: 'legs', equipment: 'bodyweight', type: 'strength', instructions: '1. Stand with feet shoulder-width apart, toes slightly out.\n2. Keep chest up and core engaged.\n3. Lower hips back and down, knees tracking over toes.\n4. Descend until thighs parallel to ground.\n5. Drive through heels to return to start.', image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80', video_url: null, calories_per_minute: 8 },
      { name: 'Lunges', description: 'Single leg strength and balance', muscle_group: 'legs', equipment: 'bodyweight', type: 'strength', instructions: '1. Stand tall with feet hip-width apart.\n2. Step forward with one leg.\n3. Lower back knee toward ground.\n4. Keep front knee over ankle.\n5. Push through front heel to return.', image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80', video_url: null, calories_per_minute: 7 },
      { name: 'Leg Press', description: 'Quad and glute builder', muscle_group: 'legs', equipment: 'machine', type: 'strength', instructions: '1. Sit in machine with back flat against pad.\n2. Place feet on platform shoulder-width apart.\n3. Release safety and lower weight by bending knees.\n4. Press through heels to extend legs.\n5. Don\'t lock knees at top.', image_url: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800&q=80', video_url: null, calories_per_minute: 6 },
      
      // Shoulder exercises
      { name: 'Shoulder Press', description: 'Overhead pressing power', muscle_group: 'shoulders', equipment: 'dumbbells', type: 'strength', instructions: '1. Start with dumbbells at shoulder height.\n2. Keep core engaged and back straight.\n3. Press weights overhead until arms extended.\n4. Lower with control back to shoulders.\n5. Avoid arching back excessively.', image_url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80', video_url: null, calories_per_minute: 6 },
      { name: 'Lateral Raises', description: 'Side delt isolation', muscle_group: 'shoulders', equipment: 'dumbbells', type: 'strength', instructions: '1. Stand with dumbbells at sides, slight bend in elbows.\n2. Raise arms out to sides.\n3. Lift until arms parallel with floor.\n4. Lead with elbows, not hands.\n5. Lower slowly to starting position.', image_url: 'https://images.unsplash.com/photo-1584466990037-3bb396c1e5e9?w=800&q=80', video_url: null, calories_per_minute: 5 },
      
      // Arms exercises
      { name: 'Bicep Curls', description: 'Classic arm builder', muscle_group: 'arms', equipment: 'dumbbells', type: 'strength', instructions: '1. Hold dumbbells at sides with palms forward.\n2. Keep elbows close to torso.\n3. Curl weights up by bending elbows.\n4. Squeeze biceps at the top.\n5. Lower slowly with control.', image_url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800&q=80', video_url: null, calories_per_minute: 4 },
      { name: 'Tricep Dips', description: 'Bodyweight tricep developer', muscle_group: 'arms', equipment: 'bodyweight', type: 'strength', instructions: '1. Support yourself on parallel bars or bench.\n2. Start with arms fully extended.\n3. Lower body by bending elbows to 90 degrees.\n4. Press back up to starting position.\n5. Keep core engaged throughout.', image_url: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&q=80', video_url: null, calories_per_minute: 7 },
      
      // Core exercises
      { name: 'Plank', description: 'Core stability foundation', muscle_group: 'core', equipment: 'bodyweight', type: 'strength', instructions: '1. Start in forearm plank with elbows under shoulders.\n2. Keep body in straight line from head to heels.\n3. Engage core and squeeze glutes.\n4. Don\'t let hips sag or pike up.\n5. Hold position while breathing steadily.', image_url: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&q=80', video_url: null, calories_per_minute: 5 },
      { name: 'Crunches', description: 'Upper ab developer', muscle_group: 'core', equipment: 'bodyweight', type: 'strength', instructions: '1. Lie on back with knees bent, feet flat.\n2. Place hands behind head lightly.\n3. Lift shoulders off ground by contracting abs.\n4. Keep lower back on floor.\n5. Lower slowly and repeat.', image_url: 'https://images.unsplash.com/photo-1518611507436-f9221403cca2?w=800&q=80', video_url: null, calories_per_minute: 4 },
      { name: 'Russian Twists', description: 'Oblique strengthener', muscle_group: 'core', equipment: 'bodyweight', type: 'strength', instructions: '1. Sit with knees bent, feet off ground.\n2. Lean back slightly, keep back straight.\n3. Twist torso side to side.\n4. Touch floor beside each hip.\n5. Keep core engaged throughout.', image_url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80', video_url: null, calories_per_minute: 6 },
      
      // Cardio exercises
      { name: 'Running', description: 'Classic cardiovascular exercise', muscle_group: 'cardio', equipment: 'treadmill', type: 'cardio', instructions: '1. Start at comfortable warm-up pace for 3-5 minutes.\n2. Maintain upright posture, shoulders relaxed.\n3. Keep arms bent at 90 degrees, swinging naturally.\n4. Land mid-foot and roll through to toes.\n5. Breathe rhythmically, maintain steady pace.', image_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80', video_url: null, calories_per_minute: 10 },
      { name: 'Cycling', description: 'Low-impact cardio', muscle_group: 'cardio', equipment: 'bike', type: 'cardio', instructions: '1. Adjust seat so leg almost fully extends at bottom.\n2. Keep shoulders relaxed, core engaged.\n3. Maintain steady cadence of 80-100 RPM.\n4. Vary resistance for intensity changes.\n5. Stay hydrated throughout session.', image_url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80', video_url: null, calories_per_minute: 8 },
      { name: 'Jumping Jacks', description: 'Full body cardio warmup', muscle_group: 'cardio', equipment: 'bodyweight', type: 'cardio', instructions: '1. Start standing with feet together, arms at sides.\n2. Jump while spreading legs and raising arms overhead.\n3. Jump back to starting position.\n4. Maintain rhythm and steady breathing.\n5. Land softly on balls of feet.', image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80', video_url: null, calories_per_minute: 9 },
      { name: 'Burpees', description: 'High intensity full body', muscle_group: 'full_body', equipment: 'bodyweight', type: 'cardio', instructions: '1. Start standing, drop into squat position.\n2. Place hands on floor, jump feet back to plank.\n3. Perform a push-up.\n4. Jump feet back to hands.\n5. Jump up explosively with arms overhead.', image_url: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800&q=80', video_url: null, calories_per_minute: 12 },
      
      // Flexibility
      { name: 'Yoga Flow', description: 'Full body flexibility', muscle_group: 'full_body', equipment: 'bodyweight', type: 'flexibility', instructions: '1. Begin in mountain pose, breathing deeply.\n2. Flow through downward dog to plank.\n3. Move into cobra or upward dog.\n4. Return to downward dog.\n5. Focus on breath and stretching major muscle groups.', image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', video_url: null, calories_per_minute: 3 },
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
