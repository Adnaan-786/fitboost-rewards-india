-- Create enum types for exercises
CREATE TYPE exercise_type AS ENUM ('cardio', 'strength', 'flexibility', 'sports');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE muscle_group AS ENUM ('chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body', 'cardio');
CREATE TYPE equipment_type AS ENUM ('bodyweight', 'dumbbells', 'barbell', 'machine', 'resistance_bands', 'kettlebell', 'treadmill', 'bike', 'other');

-- Exercises library table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  muscle_group muscle_group NOT NULL,
  equipment equipment_type NOT NULL,
  type exercise_type NOT NULL,
  instructions TEXT,
  image_url TEXT,
  video_url TEXT,
  calories_per_minute INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout plans table (pre-built routines)
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  difficulty_level difficulty_level NOT NULL,
  duration_weeks INTEGER,
  estimated_duration_minutes INTEGER,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for workout plans and exercises
CREATE TABLE workout_plan_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  sets INTEGER,
  reps INTEGER,
  duration_seconds INTEGER,
  rest_seconds INTEGER DEFAULT 60
);

-- User custom workouts table
CREATE TABLE user_custom_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for user custom workouts and exercises
CREATE TABLE user_workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_workout_id UUID NOT NULL REFERENCES user_custom_workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  sets INTEGER,
  reps INTEGER,
  duration_seconds INTEGER,
  rest_seconds INTEGER DEFAULT 60
);

-- Workout sessions table (tracks active and completed workouts)
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workout_plan_id UUID REFERENCES workout_plans(id) ON DELETE SET NULL,
  user_workout_id UUID REFERENCES user_custom_workouts(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_duration_seconds INTEGER,
  total_calories_burned INTEGER,
  notes TEXT
);

-- Exercise logs table (tracks sets, reps, weight for each exercise in a session)
CREATE TABLE exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight_kg NUMERIC(6,2),
  duration_seconds INTEGER,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plan_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_custom_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercises (everyone can view, admins can manage)
CREATE POLICY "Everyone can view exercises" ON exercises FOR SELECT USING (true);
CREATE POLICY "Admins can manage exercises" ON exercises FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for workout_plans (everyone can view, admins can manage)
CREATE POLICY "Everyone can view workout plans" ON workout_plans FOR SELECT USING (true);
CREATE POLICY "Admins can manage workout plans" ON workout_plans FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for workout_plan_exercises (everyone can view, admins can manage)
CREATE POLICY "Everyone can view workout plan exercises" ON workout_plan_exercises FOR SELECT USING (true);
CREATE POLICY "Admins can manage workout plan exercises" ON workout_plan_exercises FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_custom_workouts (users can manage their own)
CREATE POLICY "Users can view their own custom workouts" ON user_custom_workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own custom workouts" ON user_custom_workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own custom workouts" ON user_custom_workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own custom workouts" ON user_custom_workouts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_workout_exercises (users can manage their own)
CREATE POLICY "Users can view their own workout exercises" ON user_workout_exercises FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_custom_workouts WHERE id = user_workout_exercises.user_workout_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create their own workout exercises" ON user_workout_exercises FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_custom_workouts WHERE id = user_workout_exercises.user_workout_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update their own workout exercises" ON user_workout_exercises FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_custom_workouts WHERE id = user_workout_exercises.user_workout_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete their own workout exercises" ON user_workout_exercises FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_custom_workouts WHERE id = user_workout_exercises.user_workout_id AND user_id = auth.uid())
);

-- RLS Policies for workout_sessions (users can manage their own)
CREATE POLICY "Users can view their own workout sessions" ON workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own workout sessions" ON workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workout sessions" ON workout_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workout sessions" ON workout_sessions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for exercise_logs (users can manage their own)
CREATE POLICY "Users can view their own exercise logs" ON exercise_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM workout_sessions WHERE id = exercise_logs.workout_session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create their own exercise logs" ON exercise_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM workout_sessions WHERE id = exercise_logs.workout_session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update their own exercise logs" ON exercise_logs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM workout_sessions WHERE id = exercise_logs.workout_session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete their own exercise logs" ON exercise_logs FOR DELETE USING (
  EXISTS (SELECT 1 FROM workout_sessions WHERE id = exercise_logs.workout_session_id AND user_id = auth.uid())
);

-- Trigger for updating user_custom_workouts.updated_at
CREATE TRIGGER update_user_custom_workouts_updated_at
  BEFORE UPDATE ON user_custom_workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_exercises_equipment ON exercises(equipment);
CREATE INDEX idx_exercises_type ON exercises(type);
CREATE INDEX idx_workout_plan_exercises_workout_plan_id ON workout_plan_exercises(workout_plan_id);
CREATE INDEX idx_user_custom_workouts_user_id ON user_custom_workouts(user_id);
CREATE INDEX idx_user_workout_exercises_user_workout_id ON user_workout_exercises(user_workout_id);
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_exercise_logs_workout_session_id ON exercise_logs(workout_session_id);